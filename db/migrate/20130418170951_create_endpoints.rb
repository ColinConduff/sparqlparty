class CreateEndpoints < ActiveRecord::Migration
  def change
    create_table :endpoints do |t|
      t.string :name
      t.string :sparql_url

      t.timestamps
    end
  end
end
