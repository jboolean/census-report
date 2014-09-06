require 'pp'
module QueryParse
  COLS_WITH_DEFS = ['occp', 'fod1p', 'boro', 'grpip_group3', 'sex', 'occp_artist_class', 'occp_group', 'city']

  def valid_col? (col_name)
    # VALID_COLS.include? (col_name.downcase)
    true
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

      vals = params[param].split(',')#.map {|s| s.to_i}

      filters << {
        :operator => operator.to_sym,
        :column => column,
        :values => vals
      }
    end
    filters
  end

  def deserialize_enum(enum, value)
    enum.invert[value]
  end

  def get_facet_selections_from_query_params(prefix='facet')
    # returns enum keys, 
    # or raw values when does not correspond to an enum
    # portal should validate / parse these cases

    # prefix = 'facet'
    filters = {}
    facets = settings.facets

    params.each_key do |param|
      next unless param.start_with? "#{prefix}_"
      _, raw_facet = param.split('_', 2)

      facet = deserialize_enum(facets, raw_facet)

      if facet.nil?
        throw "No such facet=\"#{raw_facet}\""
        next
      end

      vals = params[param].split(',')

      if settings.facet_values.has_key?(facet)
        vals.map! do |val| 
          deserialize_enum(settings.facet_values[facet], val)
        end
      end


      filters[facet] = vals
    end
    filters
  end

  def get_groupbys_from_query_params
    unless params[:groupby].nil?
      groupbys = params[:groupby].split(',')
      validate_cols(groupbys)
    end
    groupbys
  end

  # this is the big one
  def create_acs_tally_sql_query(groupbys, filters, use_descriptions, sort)
    table = 'acs_3yr_custom'

    escapedColumns = groupbys.map do |col_name|
      col_name.downcase!
      if use_descriptions && has_defs?(col_name)
        escaped_table = settings.db.quote_ident("defs_#{col_name}")
        "#{escaped_table}.definition"
      else
        settings.db.quote_ident(col_name) 
      end
    end

    selectSql = 'SELECT '
    selectSql << (escapedColumns + ['sum(PWGTP)']).join(',')
    unless groupbys.empty?
      groupbySql = 'GROUP BY ' + escapedColumns.join(',')
    end

    joins = []
    if use_descriptions
      groupbys.each do |col_name|
        if has_defs?(col_name)
          escaped_col = settings.db.quote_ident(col_name)
          escaped_table = settings.db.quote_ident("defs_#{col_name}")
          joins << "INNER JOIN #{escaped_table} ON #{escaped_col} = #{escaped_table}.code"
        end
      end
    end
 
    wheres = create_whereSql(filters)
    whereSql = wheres.empty? ? '' : 'WHERE ' + wheres

    sortSql = sort ? 'ORDER BY sum(PWGTP) DESC' : ''

    "#{selectSql} FROM #{table} #{joins.join(' ')} #{whereSql} #{groupbySql} #{sortSql};"
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