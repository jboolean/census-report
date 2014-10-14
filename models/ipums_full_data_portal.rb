require_relative 'ipums_portal'
class IPUMSFullDataPortal < IPUMSPortal

  COLUMN_NAMES = {
    :artist_by_occupation => 'occ_artist_class',
    :artist_by_education => 'artist_degree',
    :sex => 'sex',
    :race_hispan_simple => 'race_hispan_simple',
    :education => 'educ',
    :city => 'city',
    :rentburden => 'rentburden_classes',
    :degfield => 'degfieldd'

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

  def tableName
    'ipums_2011'
  end

  def getPovertyRate(db, facets)
    whereSql = getWhereSql(db, facets)
    # return whereSql.inspect

    whereSql = 'WHERE ' + whereSql unless whereSql.empty?
    
    sqlQuery = "select 
                sum(PERWT) as population,
                ((SUM(CASE WHEN POVERTY < 100 then PERWT else 0 end) * 100.0) / 
                  SUM(CASE WHEN POVERTY is not null then PERWT else 0 end)) as poverty_rate
                from

                (SELECT PERWT, POVERTY from ipums_2011
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

  SCHOOL_TO_WORK_THRESHOLD = 3500
  def getSchoolToWork(db, facets)

    #   def getTally(db, groupbys, facets, description_tables, sort)
    description_tables = {
      'degfieldd' => 'defs_fod1p',
      'occ_group3' => 'defs_occ_group3'
    }

    tallyResult = getTally(db, ['degfieldd', 'occ_group3'], facets, description_tables, false)

    occCol = 1
    degCol = 0
    countCol = 2

    totalPop = 0;

    occupationTotals = Hash.new(0)

    tallyResult.each do |row|
      occ = row[occCol]
      count = row[countCol].to_i
      occupationTotals[occ] += count
      totalPop += count
    end

    threshold = SCHOOL_TO_WORK_THRESHOLD
    # threshold = totalPop * 0.01
    # threshold = 200 if threshold < 200

    big = []
    others = Hash.new(0)

    tallyResult.each do |row|
      count = row[countCol].to_i
      fod = row[degCol]
      occ = row[occCol]

      if occupationTotals[occ] >= threshold
        big << [fod, occ, count]
      else
        others[fod] += count
      end
    end

    otherOccupations = occupationTotals.select do |occ, count|
      count < threshold
    end

    out = [['Field of Degree', 'Occupation', 'Count']];

    out.concat(big)
    others.each do |fod, count|
      out << [fod, 'Miscellaneous', count]
    end

    {
      :results => out,
      :fields => ['Field of Degree', 'Occupation Group', 'Count'], 
      :citation => 'American Community Survey 2009-2011, processed by IPUMS and BFAMFAPhD',
      :otherOccupations => otherOccupations.keys,
      :threshold => threshold,
      :populationSize => totalPop
    }
  end


end