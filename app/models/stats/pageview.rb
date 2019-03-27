class Stats::Pageview < ApplicationRecord

  self.table_name = 'stats_pageviews'

  # relations
  belongs_to :session, class_name: 'Stats::Session'
  belongs_to :content, polymorphic: true, required: false

end
