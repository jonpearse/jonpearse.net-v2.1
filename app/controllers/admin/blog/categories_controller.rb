class Admin::Blog::CategoriesController < Admin::CmsController

  def initialize
    super

    @model_class = Category
    @allow[:search] = true
    @searchable_fields = [ :name ]

  end

end
