module QueryParse
  VALID_COLS = ['relp', 'agep',  'fod1p', 'occp',  'cit', 'sex', 'schl',  
    'wagp',  'cow', 'ethnicity', 'boro',  'ten', 'grpip', 'pwgtp', 'wgtp', 'grpip_group3']
  COLS_WITH_DEFS = ['occp', 'fod1p', 'boro', 'grpip_group3']

  def valid_col? (col_name)
    VALID_COLS.include? (col_name.downcase)
  end

  def validate_cols (cols)
    cols.each do |col_name|

      if !valid_col?(col_name)
        halt 400, "Column #{col_name} is not known." 
      end

    end
  end

  def has_defs?(col_name)
    COLS_WITH_DEFS.include? (col_name.downcase)
  end

  def get_filters_from_query_params
    filters = []
    params.each_key do |param|
      next unless param.start_with? 'filter_'
      _, operator, column = param.split('_')
      validate_cols([column])

      vals = params[param].split(',').map {|s| s.to_i}

      filters << {
        :operator => operator.to_sym,
        :column => column,
        :values => vals
      }
    end
    filters
  end

  def create_whereSql(filters)
    wheres = []
    pp filters
    filters.each do |filter|
      case filter[:operator]
      when :eq, :in
        wheres << "#{settings.db.quote_ident(filter[:column])} in 
        (#{settings.db.escape_string(filter[:values].join(','))}) "
      end
    end
    return wheres.join(' AND ')
  end

  def last_col_to_i(data)
    data.map do |row|
      row[0..-2] + [row[-1].to_i]
    end
  end

  def last_col_to_percent(data)
    total = 0;
    data.each do |row|
      total += row[-1]
    end
    data.map do |row|
      row[0..-2] + [row[-1].to_f/total]
    end
  end


end