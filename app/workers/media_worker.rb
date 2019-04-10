class MediaWorker
  include Sidekiq::Worker

  def perform( id )

    Media.find( id ).generate_preview!

  end
end
