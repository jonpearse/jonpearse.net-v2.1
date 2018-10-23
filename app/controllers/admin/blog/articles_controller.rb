class Admin::Blog::ArticlesController < Admin::CMSController

  def initialize
    super

    @model_class = Article
  end

end
