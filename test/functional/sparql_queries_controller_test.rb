require 'test_helper'

class SparqlQueriesControllerTest < ActionController::TestCase
  setup do
    @sparql_query = sparql_queries(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:sparql_queries)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create sparql_query" do
    assert_difference('SparqlQuery.count') do
      post :create, sparql_query: { body: @sparql_query.body, name: @sparql_query.name }
    end

    assert_redirected_to sparql_query_path(assigns(:sparql_query))
  end

  test "should show sparql_query" do
    get :show, id: @sparql_query
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @sparql_query
    assert_response :success
  end

  test "should update sparql_query" do
    put :update, id: @sparql_query, sparql_query: { body: @sparql_query.body, name: @sparql_query.name }
    assert_redirected_to sparql_query_path(assigns(:sparql_query))
  end

  test "should destroy sparql_query" do
    assert_difference('SparqlQuery.count', -1) do
      delete :destroy, id: @sparql_query
    end

    assert_redirected_to sparql_queries_path
  end
end
