class Site::BaseController < ApplicationController
  
  # set the default layout
  layout 'site'
  
  def initialize
    super
  end
  
end