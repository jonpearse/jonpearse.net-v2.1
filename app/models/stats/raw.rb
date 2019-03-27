class Stats::Raw < ApplicationRecord

  self.table_name = 'stats_raw'

  # we always want to select before today
  default_scope -> { where(
    '( recorded_at < ? ) AND ( browser_name != ? )',
    Date.today.at_midnight,
    'Generic Browser'
  ).order( 'recorded_at ASC' )}

  # aggregation scopes
  scope :trackable, -> { select( "DISTINCT( `session_id` )" )}
  scope :anonymous, -> { where( session_id: nil )}

  # lookup scope
  scope :by_session, -> ( session_id ){ where( session_id: session_id )}

end
