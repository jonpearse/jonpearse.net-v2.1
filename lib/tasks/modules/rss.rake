namespace :jjp2 do

  namespace :rss do

    desc "Regenerate RSS feeds"
    task generate: :environment do

      # get our directory + ensure it exists
      out_dir = Rails.application.config.feeds_directory
      mkdir_p( out_dir ) unless Dir.exists?( out_dir )

      # render out the full feed
      File.open( out_dir.join( 'full.xml' ), 'w' ) { |f| f.write( Site::BaseController.render( 'feeds/articles', assigns: {
        articles: Article.published.latest.limit( 10 ),
        full: true
      }))}

      # render out the basic feed
      File.open( out_dir.join( 'summary.xml' ), 'w' ) { |f| f.write( Site::BaseController.render( 'feeds/articles', assigns: {
        articles: Article.published.latest.limit( 10 ),
        full: false
      }))}

    end

  end

end
