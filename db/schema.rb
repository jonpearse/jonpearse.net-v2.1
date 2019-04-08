# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_04_08_230018) do

  create_table "active_storage_attachments", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "articles", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.bigint "masthead_id"
    t.string "title", limit: 64
    t.string "summary", limit: 1024
    t.text "body"
    t.boolean "published", default: false, null: false
    t.date "published_on"
    t.string "slug", limit: 64
    t.string "url", limit: 80
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["masthead_id"], name: "index_articles_on_masthead_id"
  end

  create_table "articles_categories", id: false, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.bigint "article_id"
    t.bigint "category_id"
    t.index ["article_id"], name: "index_articles_categories_on_article_id"
    t.index ["category_id"], name: "index_articles_categories_on_category_id"
  end

  create_table "categories", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "name", limit: 64
    t.string "slug", limit: 64
    t.integer "article_count", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "clients", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "name", limit: 64
    t.string "uri", limit: 128
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "media", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "title"
    t.string "alt_text"
    t.string "caption"
    t.text "transcript"
    t.binary "preview", limit: 2048
    t.string "colour"
    t.float "aspect_ratio", default: 1.0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "projects", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.bigint "preview_id"
    t.bigint "client_id"
    t.bigint "article_id"
    t.string "title", limit: 64
    t.text "description"
    t.string "uri", limit: 128
    t.boolean "live"
    t.date "live_date"
    t.boolean "published"
    t.string "slug", limit: 64
    t.string "url", limit: 80
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["article_id"], name: "index_projects_on_article_id"
    t.index ["client_id"], name: "index_projects_on_client_id"
    t.index ["preview_id"], name: "index_projects_on_preview_id"
  end

  create_table "projects_techs", id: false, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.bigint "project_id", null: false
    t.bigint "tech_id", null: false
    t.index ["project_id"], name: "index_projects_techs_on_project_id"
    t.index ["tech_id"], name: "index_projects_techs_on_tech_id"
  end

  create_table "shortcodes", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "code", limit: 8, null: false
    t.string "content_type"
    t.bigint "content_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["content_type", "content_id"], name: "index_shortcodes_on_content_type_and_content_id"
  end

  create_table "snippets", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "ident", limit: 32
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

# Could not dump table "stats_ip_blocks" because of following StandardError
#   Unknown type 'polygon' for column 'ip_range'

  create_table "stats_pageviews", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "session_id"
    t.string "url", limit: 128
    t.string "content_type"
    t.bigint "content_id"
    t.datetime "recorded_at"
    t.index ["content_type", "content_id"], name: "index_stats_pageviews_on_content_type_and_content_id"
    t.index ["session_id"], name: "index_stats_pageviews_on_session_id"
    t.index ["url", "session_id"], name: "index_stats_pageviews_on_url_and_session_id"
  end

  create_table "stats_raw", id: false, options: "ENGINE=Aria DEFAULT CHARSET=utf8 PAGE_CHECKSUM=1", force: :cascade do |t|
    t.string "session_id", limit: 32
    t.string "country"
    t.string "browser_name"
    t.float "browser_version"
    t.string "url_path"
    t.boolean "dark_mode", default: false
    t.datetime "recorded_at"
    t.string "content_type"
    t.bigint "content_id"
  end

  create_table "stats_sessions", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "key", limit: 32
    t.string "country", limit: 4
    t.string "ua_name", limit: 64
    t.float "ua_version"
    t.boolean "dark_mode", default: false
    t.date "recorded_on"
    t.index ["country"], name: "index_stats_sessions_on_country"
    t.index ["ua_name", "ua_version"], name: "index_stats_sessions_on_ua_name_and_ua_version"
  end

  create_table "techs", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "name", limit: 32
    t.text "icon"
    t.string "slug", limit: 32
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.boolean "second_factor_enabled", default: false, null: false
    t.integer "second_factor_attempts_count", default: 0, null: false
    t.string "encrypted_otp_secret_key"
    t.string "encrypted_otp_secret_key_iv"
    t.string "encrypted_otp_secret_key_salt"
    t.string "direct_otp"
    t.datetime "direct_otp_sent_at"
    t.timestamp "totp_timestamp"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["encrypted_otp_secret_key"], name: "index_users_on_encrypted_otp_secret_key", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

  add_foreign_key "articles", "media", column: "masthead_id"
  add_foreign_key "articles_categories", "articles"
  add_foreign_key "articles_categories", "categories"
  add_foreign_key "projects", "articles"
  add_foreign_key "projects", "clients"
  add_foreign_key "projects", "media", column: "preview_id"
  add_foreign_key "stats_pageviews", "stats_sessions", column: "session_id"

  create_view "stats_deduped_pageviews", sql_definition: <<-SQL
      select `dev_jjp21`.`stats_pageviews`.`session_id` AS `session_id`,`dev_jjp21`.`stats_pageviews`.`url` AS `url`,`dev_jjp21`.`stats_pageviews`.`content_type` AS `content_type`,`dev_jjp21`.`stats_pageviews`.`content_id` AS `content_id` from `dev_jjp21`.`stats_pageviews` group by concat(`dev_jjp21`.`stats_pageviews`.`session_id`,`dev_jjp21`.`stats_pageviews`.`url`) order by `dev_jjp21`.`stats_pageviews`.`session_id`
  SQL
end
