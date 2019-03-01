class Admin::Auth::TwoFactorController < Admin::BaseController

  helper Admin::QRHelper

  before_action :check_if_disabled, only: [ :setup,  :enable ]
  before_action :check_if_enabled,  only: [ :cancel, :disable ]

  def setup

    # grab handles for template
    @user   = current_user
    @qrcode = get_qr_code
    @failed = false

    # set breadcrumb and title
    @page_title = t( 'user.2fa.enable.title' )
    @breadcrumb = [ 'Account', 'Two-factor Authentication' ]

  end

  def enable

    @user = current_user

    if @user.confirm_totp_secret!( cookies.encrypted[:otp_secret], params[:code] )

      flash[:info] = t( 'user.2fa.enable.success' )
      redirect_to( params[:back_to] || admin_root_path )
      return

    end

    # set breadcrumb and title
    @page_title = t( 'user.2fa.enable.title' )
    @breadcrumb = [ 'Account', 'Two-factor Authentication' ]

    @failed = true
    @qrcode = get_qr_code

    render action: :setup

  end

  def cancel

    @user = current_user

    # set breadcrumb and title
    @page_title = t( 'user.2fa.disable.title' )
    @breadcrumb = [ 'Account', 'Two-factor Authentication' ]

  end

  def disable

    if current_user.disable_two_factor!

      flash[:info] = t( 'user.2fa.disable.success' )
      redirect_to admin_root_path and return

    end

    # set breadcrumb and title
    @page_title = t( 'user.2fa.disable.title' )
    @breadcrumb = [ 'Account', 'Two-factor Authentication' ]

    flash[:warn] = t( 'user.2fa.disable.failed' )
    render action: :cancel

  end

  private
    def check_if_enabled

      redirect_to( params[:back_to] || admin_auth_two_factor_path ) unless current_user.two_factor_enabled?

    end

    def check_if_disabled

      redirect_to( params[:back_to] || admin_auth_disable_two_factor_path ) if current_user.two_factor_enabled?

    end

    def get_qr_code

      # generate the secret code
      issuer  = Rack::Utils.escape_path( 'jonpearse.net' )
      secret  = @user.generate_totp_secret
      uri     = @user.provisioning_uri(
        @user.email.gsub( /@.*/, "@#{Rails.env}" ),
        { otp_secret_key: secret }
      ) + "&issuer=#{issuer}"

      # store the secret in a cookie for later
      cookies.encrypted[:otp_secret] = {
        value: secret,
        expires: 5.minutes.from_now
      }

      RQRCode::QRCode.new uri
    end

end
