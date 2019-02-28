module GeoIPHelper
  require 'open-uri'
  require 'csv'
  require 'ipaddr'

  def loadData( source_file, db_table )

    # create our new database table
    new_db_table = "#{db_table}_new"
    xqt( "DROP TABLE IF EXISTS `#{new_db_table}`" )
    xqt( "CREATE TABLE `#{new_db_table}` LIKE `#{db_table}`" );

    # create the temp name
    temp_file = Tempfile.new([ 'geoip', '.tgz' ], Rails.root.join( 'tmp' ))

    # download everything
    print 'Loading data from MaxMind'.cyan.bold + " (#{source_file})… "
    File.open( temp_file, 'w' ) do |f|

      IO.copy_stream( open( source_file ), f )

    end
    puts "done"

    # decompress
    print 'Decompressing… '.cyan.bold
    `unzip -o #{temp_file.path} -d #{Rails.root.join( 'tmp' )}`
    puts "done"

    # find the appropriate file
    Dir.glob( Rails.root.join( 'tmp' ) + 'GeoLite2-Country-CSV*' ) do |f|

      puts "Processing data in #{f}…"

      unless File.exist?( "#{f}/GeoLite2-Country-Blocks-IPv4.csv" ) and File.exist?( "#{f}/GeoLite2-Country-Locations-en.csv" )
        next
      end

      # Dump in a quick loopback for testing
      insert_block( '127.0.0.1/8', '_LO', "#{new_db_table}" )

      # load countries
      countries = read_countries( "#{f}/GeoLite2-Country-Locations-en.csv" )

      # load Blocks
      puts "Loading blocks (this may take some time)… "
      xqt( "ALTER TABLE `#{new_db_table}` DISABLE KEYS" );
      read_blocks( "#{f}/GeoLite2-Country-Blocks-IPv4.csv", countries, new_db_table )
      xqt( "ALTER TABLE `#{new_db_table}` ENABLE KEYS" );

      # rename things
      xqt( 'BEGIN' );
      xqt( "DROP TABLE #{db_table}" );
      xqt( "RENAME TABLE `#{new_db_table}` to `#{db_table}`" );
      xqt( 'COMMIT' );

      # Clean up
      `rm -rf #{f}`

    end

  end
  module_function :loadData

  def self.read_countries( infile )

    # load the data
    data = CSV.read( infile )

    # read the first line
    headers  = data.shift
    id_idx   = headers.find_index( 'geoname_id' )
    code_idx = headers.find_index( 'country_iso_code' )
    alt_idx  = headers.find_index( 'continent_code' )

    # build our retval
    retval = {}
    data.each do |row|

      retval[ row[id_idx].to_sym ] = row[ code_idx ] || "_#{row[ alt_idx ]}"

    end

    retval

  end

  def self.read_blocks( infile, country_lookup, db_table )

    # init some stuff
    ip_idx = nil
    country_idx = nil
    alt_idx = nil

    # start a progress file based on the row count
    bar = RakeProgressbar.new( `wc -l #{infile}`.to_i - 1 )

    # load the CSV file
    CSV.foreach( infile ) do |row|

      # assume the first row is the header
      if ip_idx.nil?

        ip_idx = row.find_index( 'network' )
        country_idx = row.find_index( 'registered_country_geoname_id' )
        alt_idx = row.find_index( 'geoname_id' )
        next

      end

      # find a country
      country_code = row[alt_idx] || row[country_idx]
      next if country_code.nil?

      # otherwise, create blocks
      insert_block( row[ip_idx], country_lookup[country_code.to_sym], db_table )

      # increment the bar
      bar.inc

    end

    # finish the progress bar
    bar.finished

  end

  def self.insert_block( ip, country, db_table )

    # create the IP range
    range  = IPAddr.new( ip ).to_range
    start  = range.first.to_i
    finish = range.last.to_i

    # build our query
    points = [
      "#{start},  -1",
      "#{finish}, -1",
      "#{finish},  1",
      "#{start},   1",
      "#{start},  -1"
    ].map{ |p| "POINT(#{p})" }

    qry = "GEOMFROMWKB(POLYGON(LINESTRING(#{points.join(',')})))"

    xqt( "INSERT INTO `#{db_table}` (ip_range, country) VALUES (#{qry}, '#{country}')" )

  end

  def self.xqt( query )

    ActiveRecord::Base.connection.execute( query )

  end

end
