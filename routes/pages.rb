# encoding: utf-8

class BFAMFAPhD < Sinatra::Application

  #define homepage
  get '/' do
    redirect to('/poverty')
  end

  get '/artistclasses' do
    @staticdata = IO.read('public/staticdata/artistclasses.json')

    erb :artistclasses
  end

  get %r{/(poverty|rentburden)} do
    page = params[:captures].first
    @cities_to_codes = IO.read('public/staticdata/cities_to_codes.json')

    erb page.to_sym
  end

  get '/*' do |page|
    path = File.join(settings.views, page+'.erb')
    pass unless File.exist?(path)

    erb page.to_sym
  end
end