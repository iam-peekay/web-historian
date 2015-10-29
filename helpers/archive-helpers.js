var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var httpReq = require('http-request');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt') // List of archived sites
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, 'utf8', function(err, data) {
    if (err) {
      throw err;
    }

    var output = data.split('\n');
    output.pop();
    console.log(output)
    callback(output);
  });
};

exports.isUrlInList = function(urlString, callback) { 
  // check if urlString in readListOfUrls, save to var
  // perform callback on bool
  exports.readListOfUrls(function(urlsArray) {
    if(urlsArray.indexOf(urlString) >= 0) {
      callback(true);
    } else {
      callback(false);
    }
  })
};

exports.addUrlToList = function(urlString, callback) {
  fs.appendFile(exports.paths.list, urlString + '\n', 'utf8', function(err) {
    callback(err);
  });
};

exports.isUrlArchived = function(urlString, callback) {
  fs.readdir(exports.paths.archivedSites, function(err, files) {
    if(files.indexOf(urlString) >= 0) {
      callback(true);
    } else {
      callback(false);
    }
  })
};

exports.downloadUrls = function(pendingList) {
  // Go through each of them
  // httpReq each file
  // save it to archives/sites
  // console.log('archiveSites: ' + exports.paths.archivedSites);
  // console.log('list: ' + exports.paths.list);
  pendingList.forEach(function(url) {
    
    // exports.addUrlToList(url, function(err) {
    //   if (err) {
    //     throw err;
    //   }
    // });
    
    httpReq.get(url, function(err, data) {
      var siteText = data.buffer.toString();
        fs.writeFile(exports.paths.archivedSites + '/' + url, siteText, function(err) {
          if (err) {
            throw err;
          }
        });
      });
    });
  }
