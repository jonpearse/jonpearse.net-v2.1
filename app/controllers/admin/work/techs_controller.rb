class Admin::Work::TechsController < Admin::CmsController

  def initialize
    super

    @model_class = Tech
  end

end
