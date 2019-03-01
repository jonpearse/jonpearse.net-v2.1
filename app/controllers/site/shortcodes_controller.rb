class Site::ShortcodesController < Site::BaseController
  include Site::RoutesHelper

  def bounce

    # bounce unless we have a key
    return not_found unless params.key?( :code )

    # find the shortcode
    code = Shortcode.find_by_code( params[:code] )
    return not_found if code.nil?

    # bounce!
    redirect_to polymorphic_url( code.content )

  end

end
