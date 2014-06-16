source "https://rubygems.org"

ruby "1.9.3"

gem "sinatra"
gem "json"
gem "pg"

gem "less"
gem "therubyracer"

group :development do
  gem "rerun"
  gem "thin"
end
group :production do
	# gem "dm-postgres-adapter"
  gem 'thin'
  gem 'unicorn'
end
