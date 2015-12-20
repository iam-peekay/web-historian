var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var Promise = require('bluebird');

// Set up our CORS headers
exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};

// Uses to serve up assets
exports.serveAssets = function(res, asset, callback) {

  var encoding = {encoding: 'utf8'};
  fs.readFile( archive.paths.siteAssets + asset, encoding, function(err, data) {
    if (err) {
      // file doesn't exist in public!
      fs.readFile( archive.paths.archivedSites + asset, encoding, function(err, data) {
        if (err) {
          // file doesn't exist in archive!
          callback ? callback() : exports.send404(res);
        } else {
          exports.sendResponse(res, data);
        }
      });
    } else {
      exports.sendResponse(res, data);
    }
  })
  };


//////////////////////////////////////////////////////////////////////////////
// The serveAssets function can be also be written using promises.
// Below are two possible versions of a promises-based solution:
//
// - standard promise syntax
// - DRYer promise syntax (uses a recursive function)
//////////////////////////////////////////////////////////////////////////////

var readFile = Promise.promisify(fs.readFile);

exports.serveAssetsQ1 = function(res, asset, callback) {
  var encoding = {encoding: 'utf8'};

  return readFile(archive.paths.siteAssets + asset, encoding)
    .then(function(contents) {
      contents && exports.sendResponse(res, contents);
    })
    .catch(function(err) {
      // file doesn't exist in public!
      return readFile(archive.paths.archivedSites + asset, encoding);
    })
    .then(function(contents) {
      contents && exports.sendResponse(res, contents);
    })
    .catch(function(err) {
      // file doesn't exist in archive!
      callback ? callback() : exports.send404(res);
    });
};

exports.serveAssetsQ2 = function(res, asset, callback) {
  var encoding = {encoding: 'utf8'};

  var assetPaths = [
    archive.paths.siteAssets,
    archive.paths.archivedSites
  ];

  var sendAsset = function(paths) {
    return readFile(paths.pop()+asset, encoding)
      .then(function(contents) {
        return exports.sendResponse(res, contents);
      })
      .catch(function(err) {
        return paths.length ? sendAsset(paths) :
              (callback ? callback() : exports.send404(res));
      });
  }

  return sendAsset(assetPaths);
};

//////////////////////////////////////////////////////////////////////////////
// Uncomment one of these lines to use an alternate version of `serveAssets`
// exports.serveAssets = exports.serveAssetsQ1;
// exports.serveAssets = exports.serveAssetsQ2;
//////////////////////////////////////////////////////////////////////////////

// Helper functions for commenly used HTTP actions
exports.sendRedirect = function(response, location, status) {
  status = status || 302;
  response.writeHead(status, {Location: location});
  response.end();
};

exports.sendResponse = function(response, obj, status) {
  status = status || 200;
  response.writeHead(status, headers);
  response.end(obj);
};

exports.collectData = function(request, callback) {
  var data = "";
  request.on("data", function(chunk) {
    data += chunk;
  });
  request.on("end", function() {
    callback(data);
  });
};

exports.send404 = function(response) {
  exports.sendResponse(response, '404: Page not found', 404);
}
