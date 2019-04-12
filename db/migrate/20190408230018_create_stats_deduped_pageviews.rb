class CreateStatsDedupedPageviews < ActiveRecord::Migration[5.2]
  def change
    create_view :stats_deduped_pageviews
  end
end
