class Tech < ApplicationRecord
  include Routable

  # relations
  has_and_belongs_to_many :projects

  # validation
  validates :name, presence: true

end
