# Base administration controller.
class Admin::BaseController < AuthenticatedController
  include Admin::I18nHelper, ErrorMethods

  # pull in some helpers
  helper Admin::NavigationHelper, Admin::I18nHelper

  # set the layout
  layout 'admin'

  # Locate ourselves in the navigation
  before_action :locate_self

  def initialize
    super

    @page_title = ''
    @breadcrumb = []

  end

  private

    # Locates the current controller within the navigation and sets the breadcrumb
    def locate_self

      # get our path
      path = controller_path.gsub( /^admin\//, '' )

      # if we know about it, set a breadcrumb
      if Rails.application.config.admin[:map].key?( path )

        @breadcrumb = Rails.application.config.admin[:map][path].deep_dup

      end

    end

end
