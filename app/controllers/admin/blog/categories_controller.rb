class Admin::Blog::CategoriesController < Admin::CMSController

  def initialize
    super

    @model_class = Category
    @allow[:search] = true
    @searchable_fields = [ :name ]

  end

end
