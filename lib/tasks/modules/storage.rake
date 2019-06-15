namespace :jjp2 do

  namespace :storage do

    desc "Downloads files from production"
    task download_from_production: :environment do
      include Rails.application.routes.url_helpers
      require 'open-uri'

      bar = RakeProgressbar.new( Media.count )

      Media.all.each do |m|

        url = "https://jonpearse.net#{_variation_path( blob_id: m.file.key )}"
        local = ActiveStorage::Blob.service.send( :path_for, m.file.key )

        # directory
        dir = File.dirname( local )
        mkdir_p( dir, verbose: false ) unless Dir.exists?( dir )

        # download
        IO.copy_stream( open( url ), local )

        bar.inc

      end

      bar.finished

    end

  end

end
