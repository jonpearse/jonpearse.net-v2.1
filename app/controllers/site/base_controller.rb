class Site::BaseController < ApplicationController
  include ErrorMethods, Site::StatsMethods

  # set the default layout
  layout :set_layout

  # Load some helpers
  helper Site::ImageHelper, Site::RoutesHelper, Site::RenderingHelper

  # have it set some cookie
  before_action :check_format_sanity, :load_settings
  after_action :set_wf_assumption

  def initialize
    super

    @page_title = nil

    @social_content = {
      title: nil,
      description: nil,
      image: nil
    }

  end

  private

    def load_settings

      @dark_mode = ( cookies.key?( :dark_mode ) and ( cookies[:dark_mode] == 'true' ))

    end

    def set_wf_assumption

      cookies[:assume_wf] = true

    end

    def set_layout

      ( !!request.xhr? ? 'site_ajax' : 'site' )

    end

    def check_format_sanity

      redirect_to( request.url.gsub( '.jhtml', '' )) if ( !request.xhr? && request[:format] == 'jhtml' )

    end

end
