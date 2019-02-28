# Main landing controller for CMS.
class Admin::DashboardController < Admin::BaseController

  def show

    @page_title = 'Dashboard'
    @breadcrumb = [ 'Dashboard' ]

  end

end
