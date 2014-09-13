# encoding: utf-8
require 'pp'
require 'json'

class BFAMFAPhD < Sinatra::Application
  THRESHOLD = 200

  get '/api/acs/custom/schooltowork/flow' do

    facetSelections = get_facet_selections_from_query_params

    cache_result = cache_get('schooltowork/flow', facetSelections)
    unless cache_result.nil?
      return cache_result
    end

    portal = IPUMSFullDataPortal.new

    response = portal.getSchoolToWork(settings.db, facetSelections).to_json

    cache_put('schooltowork/flow', facetSelections, response)
    return response

  end

  get '/api/acs/custom/schooltowork/groups' do
    facetSelections = get_facet_selections_from_query_params

    cache_result = cache_get('schooltowork/groups', facetSelections)
    unless cache_result.nil?
      return cache_result
    end

    portal = IPUMSFullDataPortal.new

    facetSelections[:artist_by_education] = [:artist];
    puts facetSelections.inspect

    arrayResult = portal.getTally(settings.db, ['occ_group'], facetSelections, {}, true)
    arrayResult = last_col_to_i(arrayResult)

    total = 0;
    arrayResult.each do |row|
      total += row[-1]
    end

    response = {
      :results => arrayResult,
      :populationSize => total
    }.to_json

    # cache_put('schooltowork/groups', facetSelections, response)
    return response
  end

end