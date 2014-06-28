class BFAMFAPhD < Sinatra::Application
  # URL_PATTERN = Regexp.new(/^(?<protocol>https?:\/\/)?(?<domain>(([a-zA-Z][\w-]*)\.)+[a-z]{2,63})(\/.*)?$/)
  # VALID_COLUMNS
  post '/api/selfreport/v1' do

    errors = {}

    if params[:project_description].nil_or_empty?
      errors[:project_description] = 'Required'
    end

    if !params[:space_zip].nil? && !(/\d{5}/.match(params[:space_zip]))
      errors[:space_zip] = 'Not a valid ZIP code'
    end

    urlMatchResult = URL_PATTERN.match(params[:project_url])
    if !params[:project_url].nil? && !urlMatchResult
      errors[:project_url] = 'Not a valid URL'
    end

    if (urlMatchResult && urlMatchResult[:protocol].nil?)
      params[:project_url] = 'http://' + params[:project_url]
    end

    unless errors.empty?
      halt 400, {:errors => 'Form field errors', :fields => errors}.to_json
    end

        sqlQueryFormat = 'INSERT INTO selfreport 
    (version, created_on, project_description, space_type, 
      space_zip, space_price_amount, space_price_unit, project_year, name, project_url) values
      (1, $1, $2, $3, $4, $5, $6, $7, $8, $9) returning *'


    sqlParams = [
      Time.now,
      params[:project_description], 
      params[:space_type],
      params[:space_zip],
      params[:space_price_amount],
      params[:space_price_time_unit],
      params[:project_year],
      params[:name],
      params[:project_url] ]
    result = settings.db.exec_params(sqlQueryFormat, sqlParams)

    hashResult = sql_to_result_hash result


    {:message => 'success', :results => hashResult}.to_json  
  end


  get '/api/selfreport/v1' do

    # todo: speed this up and paginate
    result = settings.db.exec_params('select * from selfreport order by random();')
    hashResult = sql_to_result_hash result

    {:results => hashResult}.to_json
  end
end