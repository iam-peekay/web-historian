var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelp = require(__dirname + '/http-helpers');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var fetcher = require('../workers/htmlfetcher');

// require more modules/folders here!

exports.handleRequest = function (req, res) {
  console.log(req.method);
  if (req.method === 'OPTIONS') {
    res.writeHead(200, httpHelp.headers);
    res.end();
  } else if (req.method === 'GET'){

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
      var urlString = qs.parse(body).url;
      if(urlString === undefined) {
        res.writeHead(404, httpHelp.headers)
        res.end();
      } else {
        // Get url archive, then check...
        archive.isUrlArchived(urlString, function(found) {
          // If the page is archived
          if(found) {
            console.log('i ran 1 ' + urlString)
            // Serve that page
            fs.readFile(archive.paths.archivedSites + '/' + urlString, function(err, content) {
              if (err) {
                throw err;
              }
              res.writeHead(201, httpHelp.headers);
              res.end(content);
            });
          } else { // Or if the page is not found in the archive
            // Add the url to the list.
             console.log('i ran 2 ' + urlString)
            archive.addUrlToList(urlString, function(err) {
              if (err) {
                throw err
              };
            });

            // Display loading page.
            // archive.downloadUrls([urlString]); 
            res.writeHead(300, httpHelp.headers)
            httpHelp.serveAssets(res, archive.paths.siteAssets + '/loading.html', function(err, success) {
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
        })
      }
    });
    // setInterval(fetcher.gogo, 1000);
  }
};
