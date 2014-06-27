# encoding: utf-8
require 'pp'
require 'json'

class BFAMFAPhD < Sinatra::Application

  get '/api/acs/custom/schooltowork' do


    filters = get_filters_from_query_params
    groupbys = ['fod1p', 'occp']

    sqlQuery = create_acs_tally_sql_query(groupbys, filters, params[:use_descriptions] == '1', false)

    raw = settings.db.exec(sqlQuery)

    #otherization for uncommon occupations
    big = []
    others = {}
    otherOccupations = {}
    threshold = 2000

    raw.each_row do |row|
      count = row[2].to_i
      fod = row[0]
      occp = row[1]
      if count >= threshold
        big << [fod, occp, count]
      else
        if others[fod].nil?
          others[fod] = count;
        else
          others[fod] += count
        end
        if otherOccupations[occp].nil?
          otherOccupations[occp] = count
        else
          otherOccupations[occp] += count
        end
      end
    end

    out = [['Field of Degree', 'Occupation', 'Count']];
    # out << raw[0]
    out.concat(big)
    others.each do |fod, count| 
      out << [fod, 'Other', count]
    end
    {
      :results => out,
      :fields => ['Field of Degree', 'Occupation', 'Count'], 
      :query => sqlQuery,
      :citation => 'American Community Survey 2010-2012, processed by BFAMFAPhD',
      :otherOccupations => otherOccupations.keys
    }.to_json
  end

end