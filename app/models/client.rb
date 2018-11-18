class Client < ApplicationRecord

  # relations
  has_many :projects

  # validation
  validates :name, :uri, presence: true

end
