class Site::SnippetsController < Site::BaseController

  def show

    return not_found unless user_signed_in? && !!request.xhr? && request[:format] == 'json'

    @snippet = Snippet.find( params[:id] )

  rescue

    not_found and return

  end

  def update

    # if something’s not quite right, pretend not to be here
    return not_found unless user_signed_in? && !!request.xhr?

    # load the snippet and attempt to update it
    snippet = Snippet.find( params[:id] )
    if snippet.update_attributes( params.permit( :content ))

      render json: snippet

    else

      render json: { message: snippet.errors, status: 400 }

    end

  rescue

    not_found and return

  end

end
