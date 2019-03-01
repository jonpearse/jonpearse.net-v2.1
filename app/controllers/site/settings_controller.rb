class Site::SettingsController < Site::BaseController

  skip_after_action :record_visit

  def toggle_dark_mode

    cookies[:dark_mode] = @dark_mode ? 'false' : 'true'
    redirect_to request.referer

  end

end
