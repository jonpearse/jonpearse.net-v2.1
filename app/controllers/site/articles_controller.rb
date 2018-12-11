class Site::ArticlesController < Site::BaseController

  def index

    query = Article.published.latest

    if params.key?( :category )

      @category = Category.find_by_slug( params[:category] )

      return not_found if @category.nil?

      query = query.in( @category )

    end

    @articles = query.paginate( page: params[:page], per_page: 10 )

  end

  def show

    @article = Article.published.find_by_url( params[:url] )

  rescue

    not_found and return

  end
end
