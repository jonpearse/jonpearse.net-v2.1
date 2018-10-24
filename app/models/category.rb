class Category < ApplicationRecord
  include Routable

  # relations
  has_and_belongs_to_many :articles

  # validation
  validates :name, presence: true, length: { maximum: 64 }

  # bind before_save
  before_save :update_article_count

  scope :with_content, -> { where( 'article_count > 0' )}

  private

    def update_article_count

      write_attribute( :article_count, articles.count )

    end

end
