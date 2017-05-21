# Web Scraper

See report.pdf for the report.

`scraper.js` is the script for scraping data from Crowdcube and saving to a
MongoDB database. To save time, I've assumed that the database is not protected
with credentials. Obviously this wouldn't be the case in production!

`server.js` is a simple Express-based API for fetching collected data from the
website. Obviously this code would be much better broken up into separate files,
but for a small, non-production project I was more concerned with getting a
proof of concept script up and running.

Requirements: Node.JS 7 and above, MongoDB, NPM.

`npm install` to grab dependencies for Node. Node.JS 7 is required because of
the `async`/`await` operators.
