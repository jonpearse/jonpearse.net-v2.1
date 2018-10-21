# Base administration controller.
class Admin::BaseController < AuthenticatedController
  
  # pull in some helpers
  
  # set the layout
  layout 'admin'
  
end
