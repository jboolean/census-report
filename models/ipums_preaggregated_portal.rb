require_relative 'ipums_portal'
class IPUMSPreaggregatedPortal < IPUMSPortal
  
  COLUMN_NAMES = {
    :artist_by_occupation => 'occ_artist_class',
    :artist_by_education => 'artist_degree',
    :sex => 'sex',
    :race_hispan_simple => 'race_hispan_simple_condensed',
    :education => 'educ_condensed',
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
      :less_than_high_school => 0,
      :completed_high_school => 1,
      :some_college => 2,
      :bachelors => 3,
      :masters_or_higher => 4
    }
  }

  def getPovertyRate(db, facets)
    whereSql = getWhereSql(db, facets)
    # return whereSql.inspect

    whereSql = 'WHERE ' + whereSql unless whereSql.empty?
    
    sqlQuery = "select 
                sum(PERWT) as population,
                ((SUM(CASE WHEN POOR then PERWT else 0 end) * 100.0) / 
                  SUM(CASE WHEN POOR is not null then PERWT else 0 end)) as poverty_rate
                from
                (SELECT PERWT, POOR from preaggregated
                  #{whereSql}) filtered;"

    puts sqlQuery
    sqlResult = db.exec(sqlQuery)

    population = sqlResult[0]['population'].to_i
    povertyRate = sqlResult[0]['poverty_rate'].to_f

    {
      :populationSize => population,
      :results => {:povertyRate => povertyRate},
      :citation => 'American Community Survey 2009-2011, processed by BFAMFAPhD'
    }
  end

end