require_relative 'portal'
class IPUMSPortal < Portal
  #translate filters for IPUMS tables

  def getFilter(facet, selections)

    if facet == :city || facet == :degfield
      return {
        :column => columnNames[facet],
        :values => selections.map {|code| code.to_i},
        :operator => :in
      }
    else
      super
    end
  end

  # getPovertyRate defined in subclasses

  def getRentBurdens(db, facets, partition)
    throw 'A partition must be specified' if partition.empty?
    partitionFilters = getFilters(partition)
    partitionColumns = partitionFilters.map { |filter| filter[:column] }


    whereSql = getWhereSql(db, facets)
    partitionSql = getWhereSql(db, partition)

    andWhere = whereSql.empty? ? '' : ' AND ' + whereSql

    sqlQuery = "select #{columnNames[:rentburden]},
              sum(CASE WHEN #{partitionSql} THEN n END) as match,
              sum(CASE WHEN NOT #{partitionSql} THEN n END) as no_match
            FROM (select 
              sum(perwt) as n, #{columnNames[:rentburden]}, #{partitionColumns.join(',')} 
              from #{tableName}
              where #{columnNames[:rentburden]} is not null #{andWhere} 
              group by #{columnNames[:rentburden]}, #{partitionColumns.join(',')}) grpip_by_partition
            group by #{columnNames[:rentburden]};";

    puts sqlQuery #DELETE ME

    sqlResult = db.exec(sqlQuery)

    asArray = sqlResult.values()

    # totals for every column, the first is 0
    totals = Array.new(sqlResult.num_fields(), 0)

    # total each column 
    asArray.each do |row|
      (1..row.length-1).each do |col|
        totals[col] += row[col].to_i
      end
    end

    #calculate percentages for each population
    asArray.map! do |row|
      (1..row.length-1).each do |col|
        colTotal = totals[col]
        if colTotal == 0
          row[col] = 0
        else
          row[col] = row[col].to_f/colTotal * 100
        end
      end
      row
    end


    {
      :results => asArray,
      :populationSize => totals[1..-1],
      :fields => sqlResult.fields, 
      :query => sqlQuery,
      :citation => 'American Community Survey 2010-2012, processed by BFAMFAPhD'
    }
  end

  def getTally(db, groupbys, facets, description_tables, sort)
    escapedColumns = groupbys.map do |col_name|
      col_name.downcase!
      if description_tables.has_key?(col_name)
        escaped_table = db.quote_ident(description_tables[col_name])
        "#{escaped_table}.definition"
      else
        db.quote_ident(col_name) 
      end
    end

    selectSql = 'SELECT '
    selectSql << (escapedColumns + ['sum(perwt)']).join(',')
    unless groupbys.empty?
      groupbySql = 'GROUP BY ' + escapedColumns.join(',')
    end

    joins = []
    groupbys.each do |col_name|
      if description_tables.has_key?(col_name)
        escaped_col = db.quote_ident(col_name)
        escaped_table = db.quote_ident(description_tables[col_name])
        joins << "INNER JOIN #{escaped_table} ON #{escaped_col} = #{escaped_table}.code"
      end
    end
    
    wheres = getWhereSql(db, facets)
    whereSql = wheres.empty? ? '' : 'WHERE ' + wheres

    sortSql = sort ? 'ORDER BY sum(PERWT) DESC' : ''

    fullSql = "#{selectSql} FROM #{tableName} #{joins.join(' ')} #{whereSql} #{groupbySql} #{sortSql};"
    puts fullSql
    db.exec(fullSql).values()
  end
end