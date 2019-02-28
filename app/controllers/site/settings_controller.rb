class Site::SettingsController < Site::BaseController

  skip_after_action :toggle_dark_mode

  def toggle_dark_mode

    cookies[:dark_mode] = @dark_mode ? 'false' : 'true'
    redirect_to request.referer

  end

end
