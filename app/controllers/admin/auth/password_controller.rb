class Admin::Auth::PasswordController < Admin::BaseController

  def change

    @page_title = 'Change password'
    @breadcrumb << 'Account'

    @user = current_user

  end

  def update

    @user = User.find( current_user.id )

    # try to do things
    if @user.update_with_password( params.require( :user ).permit( :current_password, :password, :password_confirmation ))

      # log them back in
      bypass_sign_in( @user )

      # flash things
      flash[:info] = t( 'devise.passwords.changed' )

      # bounce things
      redirect_to( admin_root_path )

    else

      flash.now[:error] = t( 'devise.passwords.not_changed' )
      render( action: :change )

    end

  end

end
