# Base administration controller.
class Admin::BaseController < AuthenticatedController
  include Admin::I18nHelper

  # pull in some helpers
  helper Admin::NavigationHelper, Admin::I18nHelper

  # set the layout
  layout 'admin'

end
