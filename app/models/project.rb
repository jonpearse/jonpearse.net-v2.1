class Project < ApplicationRecord
  include Routable, SplitDate, Publishable, Shortcodable

  # relations
  belongs_to :client
  has_and_belongs_to_many :techs
  belongs_to :preview, class_name: 'Media'

  # Validation
  validates :title, :description, presence: true
  validates :uri, presence: true, if: :live?
  validates :live_date, date_in_past: true
  validates :live_date, presence: true, if: :published?

  # scope
  scope :latest, -> ( count = nil ){ order( 'live_date DESC' ).limit( count )}
  scope :live, -> { where( live: true )}
  scope :with_tech, -> ( tech ){ joins( :techs ).where( 'techs.id=?', tech.id )}

  # hook into slug generation
  after_slug_generated :update_full_url

  # hooks
  has_split_date :live_date

  # Helper functions
  def live?

    live

  end

  private

    def update_full_url

      write_attribute( :url, live_date.strftime('%Y/') + slug ) unless live_date.nil?

    end

end
