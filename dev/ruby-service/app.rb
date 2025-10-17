require 'sinatra'
require 'json'
set :bind, '0.0.0.0'

get '/health' do
  content_type :json
  { status: 'ok' }.to_json
end
