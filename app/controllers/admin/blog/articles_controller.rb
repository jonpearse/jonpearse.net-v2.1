class Admin::Blog::ArticlesController < Admin::CmsController

  def initialize
    super

    @model_class = Article
    @allow[:search] = true
    @searchable_fields = [ :title ]

  end

end
