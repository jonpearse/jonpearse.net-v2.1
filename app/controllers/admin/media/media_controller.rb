class Admin::Media::MediaController < Admin::CMSController

  def initialize
    super

    @model_class = ::Media
    @allow[:search] = true

  end

  def select

    # set select mode for the view layer
    @select_mode = true

    # otherwise, do the index thing
    index

  end

end
