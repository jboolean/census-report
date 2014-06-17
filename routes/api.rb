# encoding: utf-8
require 'pp'
require 'json'

class BFAMFAPhD < Sinatra::Application
  before '/api/*' do
    content_type :json
  end

  get '/api/acs' do
    TABLE = 'acs_3yr_custom'
    #parse http query
    groupbys = [];

    use_descriptions = params[:use_descriptions]
    calculate_percentage = params[:calculate_percentage]

    unless params[:groupby].nil?
      groupbys = params[:groupby].split(',')
      validate_cols(groupbys)
    end

    filters = get_filters_from_query_params

    # create sql query

    escapedColumns = groupbys.map do |col_name|
      col_name.downcase!
      if use_descriptions && has_defs?(col_name)
        escaped_table = settings.db.quote_ident("defs_#{col_name}")
        "#{escaped_table}.definition"
      else
        settings.db.quote_ident(col_name) 
      end
    end

    selectSql = 'SELECT '
    selectSql << (escapedColumns + ['sum(PWGTP)']).join(',')
    unless groupbys.empty?
      groupbySql = 'GROUP BY ' + escapedColumns.join(',')
    end

    joins = []
    if use_descriptions
      groupbys.each do |col_name|
        if has_defs?(col_name)
          escaped_col = settings.db.quote_ident(col_name)
          escaped_table = settings.db.quote_ident("defs_#{col_name}")
          joins << "INNER JOIN #{escaped_table} ON #{escaped_col} = #{escaped_table}.code"
        end
      end
    end
 
    wheres = create_whereSql(filters)
    whereSql = wheres.empty? ? '' : 'WHERE ' + wheres

    sqlQuery = "#{selectSql} FROM #{TABLE} #{joins.join(' ')} #{whereSql} #{groupbySql};"
    result = settings.db.exec(sqlQuery)
    arrayResult = last_col_to_i(result.values)

    total = 0;
    arrayResult.each do |row|
      total += row[-1]
    end

    if calculate_percentage && total != 0
      arrayResult.map! do |row|
        percent = row[-1].to_f/total * 100
        row[0..-2] + [percent]
      end
    end

    {
      :results => arrayResult,
      :populationSize => total,
      :fields => result.fields, 
      :query => sqlQuery,
      :citation => 'American Community Survey 2010-2012, processed by BFAMFAPhD'
    }.to_json

  end

  get '/api/acs/custom/rentburden' do
    filters = get_filters_from_query_params

    whereSql = create_whereSql(filters)

    partiton = get_filters_from_query_params('partition')
    partitionColumns = partiton.map { |filter| filter[:column] }

    if partiton.empty? then halt 400, 'A partiton must be specified' end
    partitonSql = create_whereSql(partiton)

    andWhere = whereSql.empty? ? '' : "AND #{whereSql}"

    sqlQuery = "select grpip_group3,
              sum(CASE WHEN #{partitonSql} THEN n END) as match,
              sum(CASE WHEN NOT #{partitonSql} THEN n END) as no_match
            FROM (select 
              sum(PWGTP) as n, grpip_group3, #{partitionColumns.join(',')} from acs_3yr_custom 
              where grpip_group3 is not null #{andWhere} 
              group by grpip_group3, #{partitionColumns.join(',')}) grpip_by_partition
            group by grpip_group3;";

    
    sqlResult = settings.db.exec(sqlQuery)

    asArray = sqlResult.values()

    # totals for every column, the first is 0
    totals = Array.new(sqlResult.num_fields(), 0)

    # total each column 
    asArray.each do |row|
      (1..row.length-1).each do |col|
        totals[col] += row[col].to_i
      end
    end

    #calculate percentages for each population
    asArray.map! do |row|
      (1..row.length-1).each do |col|
        colTotal = totals[col]
        if colTotal == 0
          row[col] = 0
        else
          row[col] = row[col].to_f/colTotal * 100
        end
      end
      row
    end


    {
      :results => asArray,
      :populationSize => totals[1..-1],
      :fields => sqlResult.fields, 
      :query => sqlQuery,
      :citation => 'American Community Survey 2010-2012, processed by BFAMFAPhD'
    }.to_json
  end

end