class Endpoint < ActiveRecord::Base
  has_many :sparql_queries
  attr_accessible :name, :sparql_url
end
