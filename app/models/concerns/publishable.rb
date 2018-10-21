module Publishable
  extend ActiveSupport::Concern

  included do

    scope :published, -> { where( published: true ) }

  end

  def published?

    published

  end

end
