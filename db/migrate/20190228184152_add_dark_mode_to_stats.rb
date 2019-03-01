class AddDarkModeToStats < ActiveRecord::Migration[5.2]
  def up

    add_column :stats_raw, :dark_mode, :boolean, nil: false, default: false, after: :url_path
    change_column :stats_raw, :session_id, :string, limit: 32, null: true, default: nil

  end

  def down

    remove_column :stats_raw, :dark_mode
    change_column :stats_raw, :session_id, :string, limit: 32, null: false

  end
end
