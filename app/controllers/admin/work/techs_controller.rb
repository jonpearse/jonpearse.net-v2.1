class Admin::Work::TechsController < Admin::CMSController

  def initialize
    super

    @model_class = Tech
  end

end
