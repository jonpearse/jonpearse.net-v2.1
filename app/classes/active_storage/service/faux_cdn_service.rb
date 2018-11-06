require 'active_storage/service/disk_service'

module ActiveStorage

  class Service::FauxCDNService < Service::DiskService

    attr_reader :domain

    def initialize( root: , domain: )

      @root = root
      @domain = domain

    end

    def upload( key, io, checksum: nil )

      # call up
      super

      # get the MIME type + move the file
      suffix = Rack::Mime::MIME_TYPES.invert[ Marcel::MimeType.for( io ) ]
      file   = path_for( key, '' )
      File.rename( file, "#{file}#{suffix}" ) if File.exists?( file )

    end

    def url( key, expires_in:, filename:, disposition:, content_type: )

      instrument( :url, key: key ) do |payload|

        generated_url = "#{@domain}#{folder_for( key )}/#{file_for( key )}"

        payload[:url] = generated_url

        generated_url

      end

    end

    private

      def file_for( key, suffix = nil )

        # if the suffix is nil try loading things
        if suffix.nil?

          blob   = ActiveStorage::Blob::find_by_key( key.gsub( /^(variants\/)?(\w+)(\/\w+)/, '\2' )) || nil
          suffix = blob.nil? ? '' : File.extname( blob.filename.to_s )

        end

        suffix ||= ''

        # now mangle the path
        key = key.gsub( 'variants/', '' ) + suffix

      end

      def path_for( key, suffix = nil )

        File.join( root, folder_for( key ), file_for( key, suffix ))

      end

      def folder_for( key )

        # remove the ’variant’ slug from the front, as it’s reasonably inefficient for storage
        key = key.gsub( 'variants/', '' )

        # add another level of stuff
        [ key[0..1], key[2..3], key[4..5] ].join( '/' )

      end

  end

end
