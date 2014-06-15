# encoding: utf-8
require 'pp'
require 'json'

class BFAMFAPhD < Sinatra::Application
  before '/api/*' do
    content_type :json
  end

  get '/api/graphs/sankey/fod-occp' do
    query = "select defs_fod.description as Field_of_Degree, defs_occp.description as Primary_Occupation, sum(PWGTP) 
    from acs_filtered
  inner join defs_fod on FOD1P = defs_fod.code
  inner join defs_occp on OCCP = defs_occp.code
    where FOD1P between 6000 and 6099
  group by defs_occp.description, defs_fod.description;"
    raw = settings.db.exec(query)
    big = []
    others = {}
    threshold = 100


    raw.each_row do |row|
      pp row
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
      end
    end

    out = [['Field of Degree', 'Occupation', 'Count']];
    # out << raw[0]
    out.concat(big)
    others.each do |fod, count| 
      out << [fod, 'Other', count]
    end
    return out.to_json
  end

end