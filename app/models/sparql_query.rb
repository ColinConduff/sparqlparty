class SparqlQuery < ActiveRecord::Base
  attr_accessible :body, :name
  belongs_to :endpoint
end
