class Site::BaseController < ApplicationController

  # set the default layout
  layout 'site'

  # Load some helpers
  helper Site::ImageHelper, Site::RoutesHelper, Site::RenderingHelper

  # have it set some cookie
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

    def set_wf_assumption

      cookies[:'assume-wf'] = true

    end

end
