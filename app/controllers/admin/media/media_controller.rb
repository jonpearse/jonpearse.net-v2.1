class Admin::Media::MediaController < Admin::CMSController

  def initialize
    super

    @model_class = ::Media
    @allow[:search] = true

  end

end
