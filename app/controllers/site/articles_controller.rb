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

  def feed

    return not_found unless request[:format] == 'xml'

    @articles = Article.published.latest.limit( 10 )

  end

  def show

    @article = Article.published.find_by_url( params[:url] )

  rescue

    not_found and return

  end

  def update

    # if something’s not quite right, pretend not to be here
    return not_found unless user_signed_in? && !!request.xhr?

    # load the article
    article = Article.find( params[:id] )

    # attempt to save
    if article.update_attributes( params.except( :id ).permit( Article.cms_assignable_attributes ))

      render json: article

    else

      render json: { messages: article.errors, status: 400 }

    end

  rescue

    not_found and return

  end

end
