require 'pp'
require 'json'

class BFAMFAPhD < Sinatra::Application

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