module QueryParse
  VALID_COLS = ['relp', 'agep',  'fod1p', 'occp',  'cit', 'sex', 'schl',  
    'wagp',  'cow', 'ethnicity', 'boro',  'ten', 'grpip', 'pwgtp', 'wgtp', 'grpip_group3', 'occp_artist_class']
  COLS_WITH_DEFS = ['occp', 'fod1p', 'boro', 'grpip_group3', 'sex']

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

  def get_filters_from_query_params(prefix='filter')
    filters = []
    params.each_key do |param|
      next unless param.start_with? "#{prefix}_"
      _, operator, column = param.split('_', 3)
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
      escaped_col = settings.db.quote_ident(filter[:column])
      case filter[:operator]
      when :eq, :in
        valuesAsEscapedStrings = filter[:values].map {|n| settings.db.escape_string(n.to_s)}
        wheres << "#{escaped_col} in 
        (#{valuesAsEscapedStrings.join(',')}) "
      when :between
        lower_bound = settings.db.escape_string(filter[:values][0].to_s)
        upper_bound = settings.db.escape_string(filter[:values][1].to_s)
        wheres << "#{escaped_col} BETWEEN 
        #{lower_bound} AND #{upper_bound}"
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