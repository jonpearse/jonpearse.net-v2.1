class Site::SettingsController < Site::BaseController

  def toggle_dark_mode

    cookies[:dark_mode] = @dark_mode ? 'false' : 'true'
    redirect_to request.referer

  end

end
