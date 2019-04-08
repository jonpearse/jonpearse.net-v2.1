class Stats::Report < ApplicationRecord

  self.table_name = 'stats_sessions'

  # Faux link
  belongs_to :content, polymorphic: true, required: false

  ## == Reporting scopes
  # Date filtering
  scope :since,   -> ( date ){ where( 'recorded_on >= ?', date )}
  scope :before,  -> ( date ){ where( 'recorded_on < ?', date )}
  scope :between, -> ( start, finish ){ where( '( recorded_on >= ? ) AND ( recorded_on < ? )', start, finish )}
  scope :on,      -> ( date ){ where( 'recorded_on = ?', date )}

  # Magic things
  scope :with_urls,  -> { joins( "JOIN stats_deduped_pageviews AS v ON ( stats_sessions.id = v.session_id )" ).select( 'v.content_type, v.content_id' )}
  scope :articles,    -> { with_views.where( 'v.content_type': 'Article' )}
  scope :projects,    -> { with_views.where( 'v.content_type': 'Project' )}
  scope :obv,         -> { order( 'visitors DESC' )}

  # Aggregation scopes
  scope :aggregate,   -> ( column ){ select( "#{column} AS axis, count(*) AS visitors" ).group( :axis )}
  scope :by_ua,       -> { aggregate( :ua_name ).obv }
  scope :by_version,  -> { aggregate( :ua_version ).obv }
  scope :by_country,  -> { aggregate( :country ).obv }
  scope :by_url,      -> { aggregate( :url ).obv }
  scope :by_date,     -> { aggregate( :recorded_on ).order( 'axis ASC' )}
  scope :by_content,  -> { with_urls.aggregate( 'CONCAT( v.content_type, v.content_id )' ).where( 'v.content_type IS NOT NULL' ).obv }

  # Filter scopes
  scope :for_url,     -> ( url ){ with_urls.where( 'v.url': url )}
  scope :for_ct,      -> ( type ){ with_urls.where( 'v.content_type': type )}
  scope :for_ci,      -> ( id ){ with_urls.where( 'v.content_id': id )}
  scope :for_ua,      -> ( ua ){ where( ua_name: ua )}
  scope :for_version, -> ( ua, version ){ for_ua( ua ).where( ua_version: version )}
  scope :for_country, -> ( country ){ where( country: country )}

end
