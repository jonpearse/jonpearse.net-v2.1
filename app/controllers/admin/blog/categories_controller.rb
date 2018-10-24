class Admin::Blog::CategoriesController < Admin::CMSController

  def initialize
    super

    @model_class = Category
  end

end
