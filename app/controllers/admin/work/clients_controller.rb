class Admin::Work::ClientsController < Admin::CMSController

  def initialize
    super

    @model_class = Client
  end

end
