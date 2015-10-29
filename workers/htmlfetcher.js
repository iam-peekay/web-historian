#!/usr/local/bin/env node

var archive = require('../helpers/archive-helpers');
var _ = require('underscore');
var fs = require('fs');

// // Get currently archived sites into an array
// module.exports.gogo = function() { 

fs.readdir(archive.paths.archivedSites, function(err, files) {
  var diffList = [];
  
  // Get sites in the list
  archive.readListOfUrls(function(urlList) {
    // console.log('urlList: ' + urlList);
    // console.log('files: ' + files);
    // console.log(_.difference(urlList, files));
    
    // Diff the two
    diffList = _.difference(urlList, files);
    diffList.pop();

    console.log(diffList);

  })
  // Download the sites in the diff
  archive.downloadUrls(diffList);
});

// }
// 
// */1 * * * * NODE_PATH=/Users/student/.local/bin:/Users/student/.bin:/Users/student/bin:/Users/student/sbin:/usr/local/bin:/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin PATH=/Users/student/.bin:/Users/student/bin:/Users/student/sbin:/usr/local/bin:/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin /Users/student/Codes/2015-10-web-historian/workers/htmlfetcher.js