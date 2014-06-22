require 'json'

class BFAMFAPhD < Sinatra::Application

  get '/api/acs/custom/povertyrate' do
    filters = get_filters_from_query_params

    whereSql = create_whereSql(filters)

    whereSql = 'WHERE ' + whereSql unless whereSql.empty?
    
    sqlQuery = "select 
                sum(PWGTP) as population,
                ((SUM(CASE WHEN povpip < 100 then pwgtp else 0 end) * 100.0) / 
                  SUM(CASE WHEN povpip is not null then pwgtp else 0 end)) as poverty_rate
                from

                (SELECT pwgtp, povpip from acs_3yr_custom 
                  #{whereSql}) filtered;"
    sqlResult = settings.db.exec(sqlQuery)

    population = sqlResult[0]['population'].to_i
    povertyRate = sqlResult[0]['poverty_rate'].to_f

    {
      :populationSize => population,
      :results => {:povertyRate => povertyRate},
      # :query => sqlQuery,
      :citation => 'American Community Survey 2010-2012, processed by BFAMFAPhD'
    }.to_json
  end

end