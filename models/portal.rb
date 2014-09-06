class Portal
  def columnNames
    self.class::COLUMN_NAMES
  end

  def columnValues
    self.class::COLUMN_VALUES
  end

  def tableName
    throw 'Abstract, not implemented'
  end

  def getFilters(facetSelections)
    filters = []
    facetSelections.each do |facet, selections|
      filters << getFilter(facet, selections)
    end

    return filters
  end

  def getFilter(facet, selections)
    if columnNames.has_key?(facet)
      values = []
      column_name = columnNames[facet]
      if columnValues.has_key?(facet)
        values = []
        selections.each do |selection|
          values << columnValues[facet][selection]
        end
        values.flatten!
      else
        throw "Valid values for facet are not known facet=#{facet}"
      end

      return {
        :column => column_name,
        :operator => values.length > 1 ? :in : :eq,
        :values => values
      }
    else
      throw "Facet not known for this table"
    end

  end

  def getWhereSql(db, facets)
    filters = getFilters(facets)

    wheres = []
    filters.each do |filter|
      escaped_col = db.quote_ident(filter[:column])
      case filter[:operator]
      when :eq
        val_escaped = db.escape_string(filter[:values][0].to_s)
        wheres << "#{escaped_col} = #{val_escaped}"
      when :in
        valuesAsEscapedStrings = filter[:values].map {|n| db.escape_string(n.to_s)}
        wheres << "#{escaped_col} in (#{valuesAsEscapedStrings.join(',')}) "
      when :between
        lower_bound = db.escape_string(filter[:values][0].to_s)
        upper_bound = db.escape_string(filter[:values][1].to_s)
        wheres << "#{escaped_col} BETWEEN #{lower_bound} AND #{upper_bound}"
      end
    end
    return wheres.join(' AND ')
  end
end