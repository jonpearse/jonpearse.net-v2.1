class Stats::Raw < ApplicationRecord

  self.table_name = 'stats_raw'

  # we always want to select before today
  default_scope -> { where( 'recorded_at < ?', Date.today.at_midnight ).order( 'recorded_at ASC' )}

  # aggregation scopes
  scope :not_generic, -> { where( 'browser_name != ?', 'Generic Browser' )}
  scope :trackable, -> { not_generic.select( "DISTINCT( `session_id` )" ).where( 'session_id IS NOT NULL' )}
  scope :anonymous, -> { not_generic.where( session_id: nil )}

  # lookup scope
  scope :by_session, -> ( session_id ){ unscoped.not_generic.where( session_id: session_id )}

end
