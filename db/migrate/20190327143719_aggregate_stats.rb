class AggregateStats < ActiveRecord::Migration[5.2]
  def change

    create_table :stats_sessions, options: 'CHARSET=utf8' do |t|

      t.string  :key,         limit: 32
      t.string  :country,     limit: 4
      t.string  :ua_name,     limit: 64
      t.float   :ua_version
      t.boolean :dark_mode,               nil: false, default: 0
      t.date    :recorded_on

      # indexes on stuff
      t.index [ :country ]
      t.index [ :ua_name, :ua_version ]

    end

    create_table :stats_pageviews, options: 'CHARSET=utf8' do |t|

      t.references  :session, foreign_key: { to_table: :stats_sessions }
      t.string      :url, limit: 128
      t.references  :content, polymorphic: true
      t.datetime    :recorded_at

      # more indexes
      t.index [ :url, :session_id ]

    end

  end
end
