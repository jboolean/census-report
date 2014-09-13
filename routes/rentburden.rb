require 'pp'
require 'json'

class BFAMFAPhD < Sinatra::Application

  get '/api/acs/custom/rentburden' do
    facetSelections = get_facet_selections_from_query_params
    partitionFacets = get_facet_selections_from_query_params('partitionfacet')


    if facetSelections.has_key?(:city)
      portal = IPUMSFullDataPortal.new
    else
      portal = IPUMSPreaggregatedPortal.new
    end

    cache_result = cache_get('rentburden', [facetSelections, partitionFacets])
    unless cache_result.nil?
      return cache_result
    end



    response = portal.getRentBurdens(settings.db, facetSelections, partitionFacets).to_json

    cache_put('rentburden', [facetSelections, partitionFacets], response)
    response
  end

end