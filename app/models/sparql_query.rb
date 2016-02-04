class SparqlQuery < ActiveRecord::Base
  attr_accessible :name, :query, :endpoint
end
