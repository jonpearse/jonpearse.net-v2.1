class Stats::Session < ApplicationRecord

  self.table_name = 'stats_sessions'

  # relations
  has_many :pageviews, class_name: 'Stats::Pageview'

  ## == Aggregation scopes
  scope :recall_from, -> ( session_id ){ where( '`key`=? AND `recorded_on`=?', session_id, Date.yesterday ) }

end
