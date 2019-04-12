class AddCronlogs < ActiveRecord::Migration[5.2]
  def change

    create_table :cronlogs do |t|

      t.string    :task_name, limit: 32
      t.datetime  :started
      t.datetime  :finished
      t.boolean   :viewed,                nil: false, default: 0

    end
  end
end
