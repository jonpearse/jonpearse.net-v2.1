namespace :jjp2 do

  namespace :geoip do

    task load: :environment do

      source = 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country-CSV.zip'

      # parser
      parser = OptionParser.new do |opts|

        opts.banner = 'Usage: rake jjp2:geoip:load -- --source=[URL]'

        opts.on( '-s', '--source=[URL]', String, 'The URL of the source file (must be .zip)' ){ |url| source = url }

      end
      parser.parse!( parser.order( ARGV ){} )

      # pass off
      require Rails.root.join( 'lib/tasks/helpers/geoip_helper' )
      GeoIPHelper::loadData( source, :stats_ip_blocks )

    end


    task reset: :environment do

      ActiveRecord::Base.connection.execute( 'TRUNCATE TABLE stats_ip_blocks' )

    end

  end
end
