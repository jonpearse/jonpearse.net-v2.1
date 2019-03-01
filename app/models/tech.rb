class Tech < ApplicationRecord
  include Routable

  # relations
  has_and_belongs_to_many :projects

  # validation
  validates :name, presence: true

  # define a scope
  default_scope -> { order( :name )}
  scope :with_projects, -> { joins( :projects ).group( :id ) }

end
