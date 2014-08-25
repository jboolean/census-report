require 'yaml'
require 'digest/murmurhash'
require 'gibbler'
require 'gibbler/mixins'

module StoredCache
  def cache_get(scope, key)
    scopedKey = {
      :scope => scope,
      :key => key
    }

    sqlQuery = "SELECT * from cache WHERE
      hash = #{_cache_make_hash(scopedKey)}"

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

    sqlParams = [_cache_make_hash(scopedKey), YAML::dump(scopedKey), YAML::dump(value)] 
    settings.db.exec_params(sqlQueryFormat, sqlParams);
  end

  def _cache_make_hash(key)
    key.gibbler.to_i % (2**32) - (2**31)
  end

end