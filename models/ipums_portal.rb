require_relative 'portal'
class IPUMSPortal < Portal
  #translate filters for IPUMS tables

  def getFilter(facet, selections)

    if facet == :city
      return {
        :column => columnNames[:city],
        :values => selections.map {|cityCode| cityCode.to_i},
        :operator => :in
      }
    else
      super
    end
  end


end