class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :two_factor_authenticatable, :database_authenticatable, #:confirmable, #:registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_one_time_password( encrypted: true )

  # Returns whether or not this user has 2 factor authentication enabled
  def two_factor_enabled?
    second_factor_enabled
  end

  # Returns whether or not the user requires two-factor authentication
  def need_two_factor_authentication?( request )
    two_factor_enabled?
  end

  # Enables 2FA for this user. This generates a new secret and stores it.
  def enable_two_factor!

    self.otp_secret_key = generate_totp_secret
    self.second_factor_enabled = true
    save(validate: false)

  end

  # Disables 2FA for this user
  def disable_two_factor!

    update_attributes second_factor_enabled: false, encrypted_otp_secret_key: nil

  end

  # Handy function that confirms and saves the secret
  def confirm_totp_secret!( secret, code )

    # if it fails…
    return false unless confirm_totp_secret( secret, code )

    # update some pointers
    self.second_factor_enabled = true
    save

  end

end
