class SparqlQueries < ActiveRecord::Migration
  def change
  	create_table :sparql_queries do |t|
		t.string :name
		t.text :query
		t.string :endpoint

		t.timestamps
	end
  end
end
