require 'json'

class BFAMFAPhD < Sinatra::Application

  get '/api/acs/custom/povertyrate' do

    facetSelections = get_facet_selections_from_query_params

    if facetSelections.has_key?(:city)
      portal = IPUMSFullDataPortal.new
    else
      portal = IPUMSPreaggregatedPortal.new
    end

    cache_result = cache_get('povertyrate', facetSelections)
    unless cache_result.nil?
      return cache_result
    end

    response = portal.getPovertyRate(settings.db, facetSelections).to_json

    cache_put('povertyrate', facetSelections, response)
    response
  end

end