class Site::BaseController < ApplicationController

  # set the default layout
  layout 'site'

  # Load some helpers
  helper Site::ImageHelper, Site::RoutesHelper, Site::RenderingHelper

end
