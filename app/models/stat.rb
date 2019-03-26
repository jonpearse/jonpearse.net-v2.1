class Stat < ApplicationRecord

  self.table_name = 'stats_raw'

  # relations
  belongs_to :content, polymorphic: true

  default_scope -> { where( "browser_name != 'Generic Browser'" )}
  scope :include_generic, -> { unscoped }

  # Simple scopes
  scope :since,   -> ( date ){ where( 'recorded_at >= ? AND recorded_at < ?', date.at_midnight, Date.today.at_midnight )}
  scope :before,  -> ( date ){ where( 'recorded_at < ?', date.at_midnight )}
  scope :between, -> ( start, finish ){ where( 'recorded_at >= ? AND recorded_at < ?', start.at_midnight, finish.at_midnight )}
  scope :on,      -> ( date ){ where( 'recorded_at >= ? AND recorded_at < ?', date.beginning_of_day, date.end_of_day )}

  # Magic stuff
  scope :with_content, -> { where( '( content_id IS NOT NULL ) and ( content_type IS NOT NULL )' )}
  scope :articles,     -> { where( content_type: 'Article' )}
  scope :projects,     -> { where( content_type: 'Project' )}

  # Grouping scopes
  scope :aggregate,  -> ( column ){ select( "#{column} AS axis, count( * ) AS visitors, content_type, content_id" ).group( :axis )}
  scope :by_ua,      -> { aggregate( :browser_name )}
  scope :by_version, -> { aggregate( :browser_version )}
  scope :by_country, -> { aggregate( :country )}
  scope :by_url,     -> { aggregate( :url_path )}
  scope :by_date,    -> { aggregate( 'DATE(recorded_at)' )}
  scope :by_content, -> { aggregate( 'CONCAT( content_type, content_id )' ).with_content }

  # Selection scopes
  scope :for_url,     -> ( url ){ where( url_path: url )}
  scope :for_content, -> ( content ){ where( content: content )}
  scope :for_ua,      -> ( ua ){ where( browser_name: ua )}
  scope :for_version, -> ( ua, version ){ for_ua( ua ).where( browser_version: version )}
  scope :for_country, -> ( country ){ where( country: country )}

end
