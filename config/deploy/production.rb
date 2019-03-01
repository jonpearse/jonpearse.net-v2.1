# server-based syntax
# ======================
# Defines a single server with a list of roles and multiple properties.
# You can define all roles on a single server, or split them:

server "jonpearse.net", user: :jon, roles: [ :web, :app, :db ]


# Configuration
# =============
# You can set any configuration variable like in config/deploy.rb
# These variables are then only loaded and set in this stage.
# For available Capistrano configuration variables see the documentation page.
# http://capistranorb.com/documentation/getting-started/configuration/
# Feel free to add new variables to customise your setup.

set :branch, :develop
set :deploy_to, "/home/jon/sites/jjp21"

set :rvm_ruby_version, '2.5.3'
