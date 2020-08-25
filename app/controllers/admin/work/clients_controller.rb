class Admin::Work::ClientsController < Admin::CmsController

  def initialize
    super

    @model_class = Client
    @allow[:search] = true
    @searchable_fields = [ :name ]

  end

end
