module GeoHelper

  def emoji_flag_for( iso_code )

    deunderscore( iso_code ).upcase.chars.map{|c|

      ( c.ord + 127397 ).chr

    }.join

  end

  def localised_name_for( iso_code )

    t( "iso639names.#{deunderscore( iso_code.upcase )}" )

  end

  private

    def deunderscore( iso_code )

      iso_code.gsub( '_', '' )

    end

end
