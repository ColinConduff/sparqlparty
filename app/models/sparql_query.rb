class SparqlQuery < ActiveRecord::Base
  attr_accessible :name, :query, :endpoint
  # belongs_to :endpoint # this may be necessary , :foreign_key => "post_id"
end
