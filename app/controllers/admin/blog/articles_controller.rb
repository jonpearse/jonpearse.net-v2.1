class Admin::Blog::ArticlesController < Admin::CMSController

  def initialize
    super

    @model_class = Article
    @allow[:search] = true
    @searchable_fields = [ :title ]

  end

end
