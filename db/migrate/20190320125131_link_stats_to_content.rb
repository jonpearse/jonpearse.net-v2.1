class LinkStatsToContent < ActiveRecord::Migration[5.2]

  def up

    # add the reference
    add_reference :stats_raw, :content, polymorphic: true, before: :recorded_at, index: false

    # now align stuff
    execute "UPDATE stats_raw AS s JOIN articles AS a ON ( s.url_path = CONCAT( '/writing/', a.url )) " +
            "SET s.content_type = 'Article', s.content_id = a.id WHERE a.id IS NOT NULL"

  end

  def down

    remove_column :stats_raw, :content_type
    remove_column :stats_raw, :content_id

  end
end
