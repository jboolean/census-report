# encoding: utf-8
require 'sinatra'
require 'erb'
require 'pg'
require 'pp'

class BFAMFAPhD < Sinatra::Application

  # set :database, ENV['DATABASE_URL'] || 'postgres://localhost'

  configure do
    set :stylesDir, File.join(settings.root, 'styles')
    set :scriptsDir, File.join(settings.root, 'scripts')

  end

  configure :production do
    set :db, PG::Connection.new(ENV['DATABASE_URL']);
  end

  configure :development do
    set :db, PG::Connection.new({:host => 'localhost', :port => 5432, :user => 'julianboilen', :dbname => 'bfamfaphd'})
  end

  configure do

    scriptsManifest = IO.readlines('scripts.manifest')
    scriptsManifest.map! {|s| s.chomp!}
    set :scriptsManifest, scriptsManifest

    stylesManifest = IO.readlines('styles.manifest')
    stylesManifest.map! {|s| s.chomp!}
    set :stylesManifest, stylesManifest
  end

  helpers do
    include Rack::Utils
    alias_method :h, :escape_html
  end
end

# require_relative 'models/init'
require_relative 'helpers/init'
require_relative 'routes/init'