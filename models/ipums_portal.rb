module IPUMSPortal
  #translate filters for IPUMS tables

  COLUMN_NAMES = {
    :artist_by_occupation => 'occ_artist_class',
    :artist_by_education => 'artist_degree',
    :sex => 'sex',
    :race_hispan_simple => 'race_hispan_simple',
    :education => 'educ',
    :city => 'city'
  }

  COLUMN_VALUES = {
    :artist_by_occupation => {
      :artists => 1,
      :other_cultural_producers => 3,
      :designers_architects => 2
    },

    :artist_by_education => {
      :artist => true
    },

    :sex => {
      :male => 1, 
      :female => 2
    },

    :race_hispan_simple => {
      :white => 1,
      :black => 2,
      :asian => 3,
      :hispanic => 999
    },

    :education => {
      :less_than_high_school => [0,1,2,3,4,5],
      :completed_high_school => [6],
      :some_college => [7, 8],
      :bachelors => [10],
      :masters_or_higher => [11]
    }
  }

  def IPUMSPortal.getSpecificFilters(facetSelections)
    filters = []
    facetSelections.each do |facet, selections|
      if COLUMN_NAMES.has_key?(facet)
        values = []
        column_name = COLUMN_NAMES[facet]
        if facet == :city
          values = selections.map {|cityCode| cityCode.to_i}
        elsif COLUMN_VALUES.has_key?(facet)
          values = []
          selections.each do |selection|
            values << COLUMN_VALUES[facet][selection]
          end
          values.flatten!
        else
          throw "Valid values for facet are not known facet=#{facet}"
        end

        filters << {
          :column => column_name,
          :operator => values.length > 1 ? :in : :eq,
          :values => values
        }
      else
        throw "Facet not known for this table"
      end
    end

    return filters
  end

end