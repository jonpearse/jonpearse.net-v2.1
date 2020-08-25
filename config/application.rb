require_relative 'boot'

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
# require "action_cable/engine"
# require "sprockets/railtie"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Jjp21
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.2

    # Autoload some stuff
    config.autoload_paths += Dir[Rails.root.join( 'app', 'classes', '*.rb' )]
    config.autoload_paths += Dir[Rails.root.join( 'app', 'renderers', '*.rb' )]

    # Pull in core extensions
    Dir[Rails.root.join( 'app', 'core_ext', '**', '*.rb' )].each{ |f| require f }

    # Also allow nested locale files
    config.i18n.load_path += Dir[Rails.root.join( 'config', 'locales', '**', '*.{rb,yml}' )]

    # Don’t automatically include all helpers: we’ll do this manually
    config.action_controller.include_all_helpers = false

    # Default the shortlink host to nil
    config.shortlink_host = nil

    # Don't generate system test files.
    config.generators.system_tests = nil

    # where to stick feeds
    config.feeds_directory = Rails.root.join( 'storage', 'feeds' )

  end
end
