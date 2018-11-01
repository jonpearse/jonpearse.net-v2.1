class Admin::Blog::CategoriesController < Admin::CMSController

  def initialize
    super

    @model_class = Category
    @allow[:search] = true

  end

  protected

    # Internal function to allow overriding of the search.
    def custom_search

      puts "Hello class!"
      @model_class.where( 'name LIKE ?', "%#{params[:search]}%" )

    end

end
