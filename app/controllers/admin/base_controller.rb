# Base administration controller.
class Admin::BaseController < AuthenticatedController

  # pull in some helpers
  helper  Admin::NavigationHelper

  # set the layout
  layout 'admin'

end
