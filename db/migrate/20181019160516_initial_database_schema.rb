class InitialDatabaseSchema < ActiveRecord::Migration[5.2]
  def change
    
    #######################
    # Media functionality #
    #######################
    create_table :active_storage_blobs do |t|
      t.string   :key,        null: false
      t.string   :filename,   null: false
      t.string   :content_type
      t.text     :metadata
      t.bigint   :byte_size,  null: false
      t.string   :checksum,   null: false
      t.datetime :created_at, null: false

      t.index [ :key ], unique: true
    end

    create_table :active_storage_attachments do |t|
      
      t.string     :name,     null: false
      t.references :record,   null: false, polymorphic: true, index: false
      t.references :blob,     null: false

      t.datetime :created_at, null: false

      t.index [ :record_type, :record_id, :name, :blob_id ], name: "index_active_storage_attachments_uniqueness", unique: true
      
    end
    
    # create the media table
    create_table :media do |t|

      t.string  :title,       length: 128
      t.string  :alt_text,    length: 255
      t.string  :caption,     length: 255
      t.text    :transcript
      t.binary  :preview,     limit: 2.kilobytes
      t.string  :colour,      length: 6

      t.timestamps

    end
    
    ######################
    # Blog functionality #
    ######################
    
    # Articles
    create_table :articles do |t|

      t.references  :masthead,      foreign_key: { to_table: :media }
      t.string      :title,         limit: 64
      t.string      :summary,       limit: 1024
      t.text        :body
      t.boolean     :published,                   null: false, default: false
      t.date        :published_on
      t.string      :slug,          limit: 64
      t.string      :url,           limit: 80
      t.timestamps

    end

    # Categories
    create_table :categories do |t|

      t.string  :name,  limit: 64
      t.string  :slug,  limit: 64
      t.integer :article_count,   null: false
      t.timestamps

    end

    # Link table
    create_join_table :articles, :categories do |t|

      t.belongs_to :article, foreign_key: true
      t.belongs_to :category, foreign_key: true

    end
    
    # Clients
    create_table :clients do |t|

      t.string  :name,  limit: 64
      t.string  :uri,   limit: 128

      t.timestamps

    end
    
    ######################
    # Work functionality #
    ######################

    # Projects
    create_table :projects do |t|
      
      t.belongs_to  :preview,       foreign_key: { to_table: :media }
      
      t.belongs_to  :client,        foreign_key: true
      t.belongs_to  :article,       foreign_key: true
      t.string      :title,         limit: 64
      t.text        :description
      t.string      :uri,           limit: 128

      # publish state
      t.boolean     :live
      t.date        :live_date
      t.boolean     :published
      t.string      :slug,          limit: 64
      t.string      :url,           limit: 80

      # timestamps
      t.timestamps

    end

    # techs
    create_table :techs do |t|

      t.string  :name,    limit: 32
      t.text    :icon

      t.string  :slug,    limit: 32

      t.timestamps

    end
    
    # join table
    create_join_table :projects, :techs do |t|
      
      t.index :project_id
      t.index :tech_id
      
    end
    
    ############
    # Webstats #
    ############
    
    # Add geoip stuff
    create_table :stats_ip_blocks, id: false, options: 'ENGINE=Aria DEFAULT CHARSET=ascii' do |t|

      t.column :ip_range, :polygon, null: false
      t.string :country, length: 4

    end
    execute "ALTER TABLE `stats_ip_blocks` ADD SPATIAL INDEX (`ip_range`)";

    # Raw stats
    create_table :stats_raw, id: false, options: 'ENGINE=Aria DEFAULT CHARSET=utf8' do |t|

      t.string    :session_id,    limit: 32, null: false
      t.string    :country,       length: 4
      t.string    :browser_name,  length: 64
      t.float     :browser_version
      t.string    :url_path
      t.datetime  :recorded_at

    end
    
    #######################
    # Miscellaneous other #
    #######################
    create_table :snippets do |t|

      t.string  :ident, limit: 32
      t.text    :content
      t.timestamps

    end
    
    create_table :shortcodes do |t|

      t.string      :code, limit: 8, null: false, unique: true
      t.references  :content, polymorphic: true
      t.timestamps

    end
    
    ######################
    # Users              #
    ######################
    create_table :users do |t|

      ## Database authenticatable
      t.string    :email,              null: false, default: ""
      t.string    :encrypted_password, null: false, default: ""

      ## Recoverable
      t.string    :reset_password_token
      t.datetime  :reset_password_sent_at

      ## Rememberable
      t.datetime  :remember_created_at

      ## Trackable
      t.integer   :sign_in_count, default: 0, null: false
      t.datetime  :current_sign_in_at
      t.datetime  :last_sign_in_at
      t.string    :current_sign_in_ip
      t.string    :last_sign_in_ip

      ## Lockable
      t.integer   :failed_attempts, default: 0, null: false # Only if lock strategy is :failed_attempts
      t.string    :unlock_token # Only if unlock strategy is :email or :both
      t.datetime  :locked_at
      
      # 2FA columns
      t.boolean   :second_factor_enabled,         null: false,  default: false
      t.integer   :second_factor_attempts_count,  null: false,  default: 0
      t.string    :encrypted_otp_secret_key
      t.string    :encrypted_otp_secret_key_iv
      t.string    :encrypted_otp_secret_key_salt
      t.string    :direct_otp
      t.datetime  :direct_otp_sent_at
      t.timestamp :totp_timestamp

      t.timestamps null: false
      
    end

    add_index :users, :email,                     unique: true
    add_index :users, :reset_password_token,      unique: true
    add_index :users, :unlock_token,              unique: true
    add_index :users, :encrypted_otp_secret_key,  unique: true
    
  end
  
end
