# config valid for current version and patch releases of Capistrano
lock "~> 3.11.0"

set :application, "jjp2"
set :repo_url, "git@github.com:jonpearse/jonpearse.net.git"

# Default value for :linked_files is []
append :linked_files, 'config/database.yml', 'config/master.key'

# Default value for linked_dirs is []
append :linked_dirs, 'log', 'tmp/pids', 'tmp/cache', 'tmp/sockets', 'storage', 'node_modules'

# Migrate things automagically
set :passenger_restart_with_touch, true

# rebuild assets before linking the release
before 'deploy:symlink:release', 'deploy:build_assets'

namespace :deploy do

  # Uploads a deployable file, switching out the environment name as necessary
  def upload_config_file( filename )

    # work out some filenames
    local  = 'config/' + filename.gsub(/^(\w+)\.(\w+)$/, '\1.deploy.\2')
    remote = "#{shared_path}/config/#{filename}"

    # check
    return if test '[ -f #{remote} ]'

    # munge + get a key
    config = YAML::load_file( local )
    candidates = config.keys.reject{ |k| k == 'default' }
    victim = candidates.first

    # write
    config[fetch( :stage.to_s )] = config[victim].dup
    config.delete( victim)
    config.delete( 'default' ) if config.key?( 'default' )

    # upload
    io = StringIO.new( YAML.dump( config ))
    upload! io, remote

  end

  desc 'Builds assets on the remote server'
  task :build_assets do

    on roles( :web ) do

      execute "cd #{release_path} && yarn && gulp build"

    end

  end

  desc 'Performs initial setup of app environment (so you don’t have to do it manually…)'
  task :initial do

    # create initial directories
    invoke 'deploy:check:directories'
    invoke 'deploy:check:linked_dirs'
    invoke 'deploy:check:make_linked_dirs'

    # ensure we have the files we need for symlinking to work
    on release_roles :all do

      # upload config templates
      upload_config_file( 'database.yml' )

      # and a yarn.lock file (which is tedious, but never mind…)
      execute :touch, "#{shared_path}/yarn.lock"

    end

  end

end

namespace :jjp do

  def run_rake_task( task )

    on primary( :app ) do

      within release_path do

        with rails_env: fetch( :rails_env ) do

          execute :rake, task

        end

      end

    end

  end

  desc "Rebuild RSS feeds"
  task :build_feeds do

    run_rake_task( 'jjp2:rss:generate' )

  end

  namespace :stats do

    desc "Reloads IP blocks"
    task :reload_ip_blocks do

      run_rake_task( 'jjp2:stats:reload_ip_blocks' )

    end

    desc "Aggregate stats"
    task :aggregate do

      run_rake_task( 'jjp2:stats:aggregate' )

    end

  end

end
