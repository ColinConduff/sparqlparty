class CreateSparqlQueries < ActiveRecord::Migration
  def change
    create_table :sparql_queries do |t|
      t.string :name
      t.text :body

      t.timestamps
    end
  end
end
