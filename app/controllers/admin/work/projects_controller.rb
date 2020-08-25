class Admin::Work::ProjectsController < Admin::CmsController

  def initialize
    super

    @model_class = Project
  end

end
