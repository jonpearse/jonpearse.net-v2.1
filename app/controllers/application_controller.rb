class ApplicationController < ActionController::Base

  protect_from_forgery with: :exception

  # pull in some helpers
  helper AssetHelper, IconHelper, GeoHelper

end
