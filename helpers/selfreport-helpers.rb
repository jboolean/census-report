module SelfReportHelpers

  URL_PATTERN = Regexp.new(/^(?<protocol>https?:\/\/)?(?<domain>(([a-zA-Z][\w-]*)\.)+[a-z]{2,63})(\/.*)?$/)

  def sql_to_result_hash(result)
    hashResult = Array.new
    result.each do |tuple|
      #return the domain as a convenience to the client
      urlMatchResult = URL_PATTERN.match(tuple['project_url'])
      pp tuple
      if (urlMatchResult)
        tuple['project_url_domain'] = urlMatchResult['domain']
      end
      hashResult << tuple
    end
    hashResult
  end
end