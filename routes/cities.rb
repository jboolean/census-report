require 'json'

class BFAMFAPhD < Sinatra::Application

  get '/api/acs/defs/city' do
    
    # sqlQuery = "SELECT * from defs_city order by definition;"
    sqlQuery = "select code, definition from defs_city inner join (select city from ipums_2011 group by city) data on code = data.city;"

    sqlResult = settings.db.exec(sqlQuery)

    cities = {}

    sqlResult.each do |tuple|
      cities[tuple['definition']] = tuple['code'].to_i
    end

    cities.to_json

  end

end