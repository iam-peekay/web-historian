var path = require('path');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!

var url = require('url');
var helpers = require('./http-helpers');

// To clean up the code, we modularize the GET and POST requests into an object
var actions = {
  'GET': function(request, response) {
    var urlPath = url.parse(request.url).pathname;

    // / means index.html
    if (urlPath === '/') { urlPath = '/index.html'; }

    helpers.serveAssets(response, urlPath, function() {
      // trim leading slash if present
      if (urlPath[0] === '/') { urlPath = urlPath.slice(1) }

      archive.isUrlInList(urlPath, function(found) {
        if (found) {
          helpers.sendRedirect(response, '/loading.html');
        } else {
          helpers.send404(response);
        }
      });
    });
  },
  'POST': function(request, response) {
    helpers.collectData(request, function(data) {
      var url = data.split('=')[1].replace('http://', '');
      // check sites.txt for web site
      archive.isUrlInList(url, function(found) {
        if (found) { // found site
          // check if site is on disk
          archive.isUrlArchived(url, function(exists) {
            if (exists) {
              // redirect to site page (/www.google.com)
              helpers.sendRedirect(response, '/' + url);
            } else {
              // Redirect to loading.html
              helpers.sendRedirect(response, '/loading.html');
            }
          });
        } else { // not found
          // add to sites.txt
          archive.addUrlToList(url, function() {
            // Redirect to loading.html
            helpers.sendRedirect(response, '/loading.html');
          });
        }
      });
    });
  }
};

// This determines what the request method is
// Then uses the above actions object to perform the appropriate action
exports.handleRequest = function (req, res) {
  var handler = actions[req.method];
  if (handler) {
    handler(req, res);
  } else {
    helpers.send404(response);
  }
};
