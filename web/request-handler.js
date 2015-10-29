var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelp = require(__dirname + '/http-helpers');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');

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
        console.log(found);
        // If the page is found in the list
        if(found) {
          // Serve that page
          fs.readFile(archive.paths.archivedSites + '/' + urlString, function(err, content) {
            if (err) {
              console.log('ERROROMG' + urlString);
              throw err;
            }
            res.writeHead(201, httpHelp.headers);
            res.end(content);
          });
        } else {
          archive.addUrlToList(urlString, function(err) {
            if (err) {
              throw err
            };
            archive.downloadUrls([urlString]); 
            // if urlString doesn't exist, 
            // TODO: Send the loading page first
            res.writeHead(300, httpHelp.headers)
            res.end(archive.paths.siteAssets + '/loading.html')
            // Then add the url to the list      
          });
        }
      })
    });
  }
};
