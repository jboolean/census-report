# encoding: utf-8

class BFAMFAPhD < Sinatra::Application

  #define homepage
  get '/' do
    redirect to('/poverty')
  end

  get '/artistclasses' do
    @staticdata = IO.read('public/staticdata/artistclasses.json')
    @page = :artistclasses
    erb @page
  end

  get %r{/(poverty|rentburden)} do
    page = params[:captures].first
    @cities_to_codes = IO.read('public/staticdata/cities_to_codes.json')
    @page = page.to_sym
    erb @page
  end

  get '/schooltowork' do
    @cities_to_codes = JSON.parse(IO.read('public/staticdata/cities_to_codes.json'))
    @page = :schooltowork
    erb @page
  end

  get '/*' do |page|
    path = File.join(settings.views, page+'.erb')
    pass unless File.exist?(path)

    @page = page.to_sym
    erb @page
  end
end