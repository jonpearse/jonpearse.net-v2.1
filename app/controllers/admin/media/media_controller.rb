class Admin::Media::MediaController < Admin::CmsController

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

  def download

    extract_content

    send_data @content.file.download, disposition: "attachment; filename=#{@content.file.filename.to_s}"

  end

end
