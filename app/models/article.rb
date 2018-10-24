class Article < ApplicationRecord
  include Routable, SplitDate, Publishable#, Shortcodable

  # relations
  has_and_belongs_to_many :categories
  # belongs_to :masthead, class_name: 'Media'

  # validation stuff
  validates :title, :summary, :body, presence: true
  validates_length_of :title, maximum: 64
  validates_length_of :summary, maximum: 1024
  validates :published_on, date_in_past: true, presence: true, if: :published?

  # hook into slug generation
  after_slug_generated :update_full_url

  # add a split date
  has_split_date :published_on

  # scope :latest, -> ( count = nil ){ order( 'published_on DESC').limit( count )}
  scope :in, -> ( category ){ joins( :categories ).where( 'categories.id=?', category.id )}

  private

    def update_full_url

      write_attribute( :url, published_on.strftime('%Y/%m/') + slug ) if published?

      true

    end

end
