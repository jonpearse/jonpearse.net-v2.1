class AddAspectRatioToMedia < ActiveRecord::Migration[5.2]
  def change

    add_column :media, :aspect_ratio, :float, default: 1, after: :colour
  end
end
