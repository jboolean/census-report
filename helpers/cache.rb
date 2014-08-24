require 'yaml'

module StoredCache
  def cache_get(scope, key)
    scopedKey = {
      :scope => scope,
      :key => key
    }

    sqlQuery = "SELECT * from cache WHERE
      hash = #{scopedKey.hash}"

    sqlResult = settings.db.exec(sqlQuery)

    if sqlResult.ntuples == 0
      puts "Cache miss key=#{scopedKey.to_s}"
    end

    sqlResult.each do |result|
      storedKey = YAML::load(result['key'])
      if scopedKey.eql? storedKey
        puts "Cache hit key=#{scopedKey}"
        return YAML::load(result['value'])
      end
    end

    return nil
  end

  def cache_put(scope, key, value)
    scopedKey = {
      :scope => scope,
      :key => key
    }

    sqlQueryFormat = "INSERT INTO cache
      (hash, key, value) values ($1, $2, $3)"

    sqlParams = [scopedKey.hash, YAML::dump(scopedKey), YAML::dump(value)] 
    settings.db.exec_params(sqlQueryFormat, sqlParams);
  end
end