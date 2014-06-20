class BFAMFAPhD < Sinatra::Application
  # VALID_COLUMNS
  post '/api/selfreport/v1' do
    pp params

    errors = {}

    if params[:project_description].nil_or_empty?
      errors[:project_description] = 'Required'
    end

    if !params[:space_zip].nil? && !(/\d{5}/.match(params[:space_zip]))
      errors[:space_zip] = 'Not a valid ZIP code'
    end

    unless params[:space_price_amount].nil?
      unless ['year', 'month', 'day', 'hour', 'minute', 'second'].include?(params[:space_price_time_unit])
        errors[:space_price_time_unit] = 'Must specify a unit of time like \'day\''
      end
    end

    unless errors.empty?
      halt 400, {:errors => 'Form field errors', :fields => errors}.to_json
    end

        sqlQueryFormat = 'INSERT INTO selfreport 
    (version, created_on, project_description, space_type, 
      space_zip, space_price_amount, space_price_unit, space_size_ft, project_year) values
      (1, $1, $2, $3, $4, $5, $6, $7, $8)'

    sqlParams = [
      Time.now,
      params[:project_description], 
      params[:space_type],
      params[:space_zip],
      params[:space_price_amount],
      params[:space_price_time_unit],
      params[:space_size_ft],
      params[:project_year] ]
    settings.db.exec_params(sqlQueryFormat, sqlParams)

    {:message => 'success'}.to_json  
  end


  get '/api/selfreport/v1' do
    result = settings.db.exec_params('select * from selfreport;')
    hashResult = Array.new
    result.each do |tuple|
      hashResult << tuple
    end
    hashResult.to_json
  end
end