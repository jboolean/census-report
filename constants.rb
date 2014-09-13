class BFAMFAPhD
  configure do

    #make a map from an an array.
    make_enum = lambda do |values|
      map = Hash.new
      values.each do |value|
        map[value] = value.to_s
      end
      return map.freeze
    end

    set :facets, make_enum.call([
        :artist_by_occupation,
        :artist_by_education,
        :borough,
        :sex,
        :race_hispan_simple,
        :education,
        :city,
        :degfield
      ])

    set :facet_values, {
      :artist_by_occupation => make_enum.call([
        :artists,
        :other_cultural_producers,
        :designers_architects]),

      :artist_by_education => make_enum.call([
        :artist]),

      :borough => make_enum.call([
        :manhattan, 
        :brooklyn, 
        :staten_island, 
        :queens, 
        :bronx]),

      :sex => make_enum.call([
        :male, 
        :female]),

      :race_hispan_simple => make_enum.call([
        :white,
        :black,
        :asian,
        :hispanic]),

      :education => make_enum.call([
        :less_than_high_school,
        :completed_high_school,
        :some_college,
        :bachelors,
        :masters_or_higher])
    }
  end
end