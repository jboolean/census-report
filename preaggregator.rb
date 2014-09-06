require 'pg'
# use :values for a direct mapping of specifed values
# or :mapping for a custom mapping of ranges
# :destination for a custom column name destination
CONFIG = {
  'occ_artist_class' => {
    :values => [0,1,2,3]
  },

  'artist_degree' => {
    :values => [true, false]
  },

  'sex' => {
    :values => [1, 2]
  },

  'educ' => {
    :destination => 'educ_condensed',
    :mapping => {
      [10] => 3,
      [11] => 4,
      [7, 8] => 2,
      [6] => 1,
      (0..5) => 0,
      'not between 0 and 11' => 999
    }
    # :values => [(0..5), 6, [7, 8], 10, 11]
  },

  'race_hispan_simple' => {
    :destination => 'race_hispan_simple_condensed',
    :mapping => {
      1 => 1,
      2 => 2,
      3 => 3,
      999 => 999,
      'not in (1,2,3,999)' => 0
    }
  },

  'rentburden_classes' => {
    :values => [0, 1, 2, nil]
  },

  'poverty' => {
    :mapping => {
      '< 100' => true,
      '>= 100' => false,
      'is null' => 'null'
    },
    :destination => 'poor'
  }
}

class Preaggregator


  def generateCombinations(toChoose)
    @count = 0
    @impossibles = 0
    results = Array.new
    generateCombinationsHelper({}, toChoose.clone, results)
    # puts "There were #{@count} combinations generated."
    puts "There were #{@impossibles} not included by optimizations."
    return results
  end

  private

  def generateCombinationsHelper(chosen, toChoose, results)
    toChoose = toChoose.clone

    if toChoose.empty?
      # puts chosen.inspect
      @count+=1
      if chosen['artist_degree'] && ![[10], [11]].include?(chosen['educ'])
        @impossibles+=1
        puts 'Impossible combination ' + chosen.inspect
        return
      end
      results << chosen
    else
      myKey, myChoices = toChoose.shift

      myChoices.each do |currentChoice|
        withCurrentChoice = chosen.clone
        withCurrentChoice[myKey] = currentChoice

        generateCombinationsHelper(withCurrentChoice, toChoose, results)
      end
    end
  end

  public

  def aggregate(db, combination, columnMapping, customValueMappings)
    wheres = []
    combination.each do |col, val|
      val = val.to_a if val.is_a? Range

      if val.nil?
        wheres << "#{col} IS NULL"
      elsif val.is_a? Array
        wheres << "#{col} in (#{val.join(',')})"
      elsif val.is_a? String
        wheres << "#{col} #{val}"
      else
        wheres << "#{col} = #{val}"
      end
    end

    whereSql = wheres.join(' AND ')

    querySql = "SELECT SUM(PERWT) as PERWT " +
      "from acs_usa_ipums_2011 WHERE #{whereSql};"

    # puts querySql
    sqlResult = db.exec(querySql)

    if sqlResult.error_message.length > 0
      puts "ERROR" + sqlResult.error_message.inspect
    end

    return if sqlResult.ntuples == 0

    weightSum = sqlResult[0]['perwt']

    return if weightSum.nil?

    columns = []
    values = []

    combination.each do |col, val|
      columns << columnMapping[col]
      if customValueMappings.has_key?(col)
        valueToInsert =  customValueMappings[col][val]
      else
        valueToInsert = val
      end

      if valueToInsert.nil? then valueToInsert = 'null' end

      values << valueToInsert
    end

    # columns = combination.keys.map {|sourceColumn| columnMapping[sourceColumn]}
    # values = combination.values

    columns << 'perwt'; values << weightSum

    insertSql = "INSERT INTO preaggregated (#{columns.join(', ')}) VALUES (#{values.join(', ')});";
    puts insertSql;

    db.exec(insertSql)

  end

  def aggregateAll(db, combinations, columnMapping, customValueMappings)
    db.exec('delete from preaggregated;')
    
    done = 0.0
    combinations.each do |combination| 
      aggregate(db, combination, columnMapping, customValueMappings)
      puts "Progress: #{done+=1}/#{combinations.length}: #{((done / combinations.length) * 100).round(2)}%"
    end
  end


end

flattenedValues = Hash.new
sourceToDest = Hash.new
customMappings = Hash.new
combinations = 1
CONFIG.each do |k, v|
  if v.has_key?(:values)
    flattenedValues[k] = v[:values]
  elsif v.has_key?(:mapping)
    flattenedValues[k] = v[:mapping].keys
    customMappings[k] = v[:mapping]
  end

  if v.has_key?(:destination)
    sourceToDest[k] = v[:destination]
  else
    sourceToDest[k] = k
  end
end

db = PG::Connection.new({:host => 'localhost', :port => 5432, :user => (`whoami`).strip, :dbname => 'bfamfaphd'})


preaggregator = Preaggregator.new
combinations = preaggregator.generateCombinations(flattenedValues)
puts "Aggregating #{combinations.length} combinations."
preaggregator.aggregateAll(db, combinations, sourceToDest, customMappings)
