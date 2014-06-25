The BMAMFAPhD Census Report
===============

Exploring data on artists in New York City.

## Development

### To setup for development
Install the Postgres database. Recommended http://postgresapp.com/ for a one-click install.

Then,
`bundle install`

### To run in devlopment
`bundle exec rerun --pattern "**/*.{rb,erb,ru}" 'thin -R config.ru start'`

### When you add a new javascript file or change their dependencies
Open the `dependencies.rb` file and edit it.
Then run `ruby create-rollups.rb` and restart the server.
Please don't add script tags, those are created automatically. The only exception is external files on a CDN.

When you add LESS files, there must be a javascript file with a matching name, that file must be listed in `dependencies.rb`,
or it must be in a `@import` statement of a LESS file that was included such as `global.less`.
Again, please don't edit the HTML to include stylesheets, this in done by the dependency manager.

Yes, there is room for improvement to this basic dependency manager I hacked together.

### Deploying to production
To run in production run `ruby create-rollups.rb --build` to generate compressed production files. Your produciton server must have RACK_ENV = production.
I *highly* recommend creating a pre-commit hook for this, and you'll never have to live in fear of deploying inconsistent code again.