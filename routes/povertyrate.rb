require 'json'

class BFAMFAPhD < Sinatra::Application

  get '/api/acs/custom/povertyrate' do
    filters = get_filters_from_query_params

    cache_result = cache_get('povertyrate', filters)
    unless cache_result.nil?
      return cache_result
    end

    whereSql = create_whereSql(filters)

    whereSql = 'WHERE ' + whereSql unless whereSql.empty?
    
    sqlQuery = "select 
                sum(PERWT) as population,
                ((SUM(CASE WHEN POVERTY < 100 then PERWT else 0 end) * 100.0) / 
                  SUM(CASE WHEN POVERTY is not null then PERWT else 0 end)) as poverty_rate
                from

                (SELECT PERWT, POVERTY from acs_usa_ipums_2011
                  #{whereSql}) filtered;"

    puts sqlQuery
    sqlResult = settings.db.exec(sqlQuery)

    population = sqlResult[0]['population'].to_i
    povertyRate = sqlResult[0]['poverty_rate'].to_f

    response = {
      :populationSize => population,
      :results => {:povertyRate => povertyRate},
      # :query => sqlQuery,
      :citation => 'American Community Survey 2009-2011, processed by BFAMFAPhD'
    }.to_json

    cache_put('povertyrate', filters, response)
    response
  end

end