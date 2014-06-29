# encoding: utf-8
require 'pp'
require 'json'

class BFAMFAPhD < Sinatra::Application
  THRESHOLD = 200

  get '/api/acs/custom/schooltowork' do


    filters = get_filters_from_query_params
    groupbys = ['fod1p', 'occp']

    sqlQuery = create_acs_tally_sql_query(groupbys, filters, params[:use_descriptions] == '1', false)

    raw = settings.db.exec(sqlQuery)

    occupationTotals = {}

    raw.each_row do |row|
      occp = row[1]
      count = row[2].to_i
      if occupationTotals[occp].nil?
        occupationTotals[occp] = count
      else
        occupationTotals[occp] += count
      end
    end


    #otherization for uncommon occupations
    big = []
    others = {}

    raw.each_row do |row|
      count = row[2].to_i
      fod = row[0]
      occp = row[1]
      if occupationTotals[occp] >= THRESHOLD
        big << [fod, occp, count]
      else
        if others[fod].nil?
          others[fod] = count;
        else
          others[fod] += count
        end
      end
    end

    otherOccupations = occupationTotals.select do |occp, count|
      count < THRESHOLD
    end




    out = [['Field of Degree', 'Occupation', 'Count']];
    # out << raw[0]
    out.concat(big)
    others.each do |fod, count| 
      out << [fod, 'Miscellaneous', count]
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