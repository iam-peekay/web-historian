var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelp = require(__dirname + '/http-helpers');
var url = require('url');
var qs = require('querystring');

// require more modules/folders here!

exports.handleRequest = function (req, res) {
    console.log('receiving');
      
  if (req.method === 'GET'){

    var filePath = url.parse(req.url).pathname;
    var asset;

    if(filePath ==='/') {
      asset = archive.paths.siteAssets + '/index.html';
    } else {
      asset = archive.paths.archivedSites + filePath;
    }

    httpHelp.serveAssets(res, asset, function(err, success) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end(err.message);
      } 
      else {
        var assetExtension = path.extname(filePath);

        if (assetExtension === '.css') {
          httpHelp.headers['Content-Type'] = 'text/html'
        }
        res.writeHead(200, httpHelp.headers);
        res.end(success);
      }
    });
  } 
  else if (req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      var urlString = body.split('=')[1];
      // Get url list, then check...
      archive.isUrlInList(urlString, function(found) {
        if(found) {
          // Serve that page
        } else {
          // if urlString doesn't exist, 
          // TODO: Send the loading page first

          // Then add the url to the list
          archive.addUrlToList(urlString, function(err) {
            if (err) {
              throw err
            };

            res.writeHead(302, httpHelp.headers);
            res.end();
          });          
        }
      })
    });
  }
};
