class Shortcode < ApplicationRecord

  belongs_to :content, polymorphic: true

  def self.for( model )

    self.create(
      content_type: model.class.to_s,
      content_id:   model.id,
      code:         SecureRandom.random_number( 36**8 ).to_s( 36 ).rjust( 8, '0' )
    )

  end

end
