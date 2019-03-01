module Shortcodable
  extend ActiveSupport::Concern

  included do

    has_one    :shortcode, as: :content
    after_save :generate_shortcode!

  end

  def generate_shortcode!

    Shortcode::for( self ) if shortcode.nil?

  end

end
