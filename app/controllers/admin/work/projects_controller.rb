class Admin::Work::ProjectsController < Admin::CMSController

  def initialize
    super

    @model_class = Project
  end

end
