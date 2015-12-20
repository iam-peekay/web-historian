var fs = require('fs');
var path = require('path');
var request = require('request');
var _ = require('underscore');

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// Reads each url in our archived sites list and sends it back in the callback
exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, function(err, sites) {
    sites = sites.toString().split('\n');
    if (callback) {
      callback(sites);
    }
  });
};

// Used to check if we can find a matching url in our archived sites list
exports.isUrlInList = function(url, callback) {
  exports.readListOfUrls(function(sites) {
    var found = _.any(sites, function(site, i) {
      return site.match(url)
    });
    callback(found);
  });
};

// Add a new url to our archive
exports.addUrlToList = function(url, callback) {
  fs.appendFile(exports.paths.list, url + '\n', function(err, file) {
    callback();
  });
};

// Checks if URL is archived AND saved as a file
exports.isUrlArchived = function(url, callback) {
  var sitePath = path.join(exports.paths.archivedSites, url);

  fs.exists(sitePath, function(exists) {
    callback(exists);
  });
};

exports.downloadUrls = function(urls) {
  // Iterate over urls and pipe to new files with the name set to the url
  _.each(urls, function (url) {
    if (!url) { return; }
    request('http://' + url).pipe(fs.createWriteStream(exports.paths.archivedSites + "/" + url));
  });
};
