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
    arrayResult.map! do |row|
      percent = total != 0 ? row[-1].to_f : 0
      row[0..-2] + [percent]
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
    whereSql = create_whereSql(filters).chomp

    andWhere = whereSql.empty? ? '' : "AND #{whereSql}"

    sqlQuery = "select  grpip_group3,
              sum(case when occp_artist_class = 0 then n end) as non_artist,
              sum(case when occp_artist_class != 0 then n end) as artist
            FROM (select 
              sum(PWGTP) as n, grpip_group3, occp_artist_class from acs_3yr_custom 
              where grpip_group3 is not null #{andWhere} 
              group by grpip_group3, occp_artist_class) grpip_by_artist
            group by grpip_group3;";

    pp sqlQuery

    output = []
    totals = [0, 0]
    sqlResult = settings.db.exec(sqlQuery)
    sqlResult.each_row do |row|
      newRow = [row[0]] + [row[1].to_i, row[2].to_i]
      totals[0] += newRow[1]
      totals[1] += newRow[2]
      output << newRow
    end


    output.map! do |row|
      percent1 = totals[0] != 0 ? row[1].to_f/totals[0] : 0
      percent2 = totals[1] != 0 ? row[2].to_f/totals[1] : 0
      [row[0]] + [percent1, percent2]
    end

    {
      :results => output,
      :populationSize => totals,
      :fields => sqlResult.fields, 
      :query => sqlQuery,
      :citation => 'American Community Survey 2010-2012, processed by BFAMFAPhD'
    }.to_json
  end

end