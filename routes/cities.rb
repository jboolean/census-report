require 'json'

class BFAMFAPhD < Sinatra::Application

  get '/api/acs/defs/city' do
    
    sqlQuery = "SELECT * from defs_city order by definition;"

    sqlResult = settings.db.exec(sqlQuery)

    cities = {}

    sqlResult.each do |tuple|
      cities[tuple['definition']] = tuple['code'].to_i
    end

    cities.to_json

  end

end