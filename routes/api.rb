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

    use_descriptions = params[:use_descriptions] == '1'
    sort = params[:sort] == '1'
    calculate_percentage = params[:calculate_percentage] == '1'

    groupbys = get_groupbys_from_query_params

    filters = get_filters_from_query_params

    # create sql query
    sqlQuery = create_acs_tally_sql_query(groupbys, filters, use_descriptions, sort)
    
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

  

end