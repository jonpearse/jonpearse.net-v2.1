# Quick geographic helper methods, mostly to provide ISO-639-2 code conversion methods.
module GeoHelper

  # Returns the ISO-639-2 country code for the given IP address
  #
  # === Parameters
  #
  # [ip] the IPv4 address to look up. If not specified, the current request IP address will be used instead.
  def country_code_for( ip = nil )

    # get a DB connection
    conn = ActiveRecord::Base.connection

    # get a current IP, if not specified
    quoted_ip = conn.quote( ip || request.ip )

    # lookup + return
    sql = "SELECT `country` FROM `stats_ip_blocks` " +
          "WHERE MBRCONTAINS( `ip_range`, POINTFROMWKB(POINT(INET_ATON( #{quoted_ip} ), 0)))"
    res = conn.execute( sql )

    ( res.count == 0 ? nil : res.first.first )

  end

  # Returns an Emoji flag for the specified ISO-639-2 code. Note that this doesn’t do any checking, so an invalid code
  # will not get you anything particularly edifying.
  #
  # === Parameters
  #
  # [iso_code] the ISO-639-2 code to convert
  def emoji_flag_for( iso_code )

    deunderscore( iso_code ).upcase.codepoints.map{ |p| p + 127397 }.pack( 'U*' )

  end

  # Returns the localised name for the provided ISO-639-2 code. This doesn’t perform any sanity checking, so an invalid
  # code will return an untranslated string.
  #
  # === Parameters
  #
  # [iso_code] the ISO-639-2 code to convert
  def localised_name_for( iso_code )

    t( "iso639names.#{deunderscore( iso_code.upcase )}" )

  end

  private

    def deunderscore( iso_code )

      iso_code.gsub( '_', '' )

    end

end
