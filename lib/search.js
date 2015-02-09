var kickass = require('kickass-search');

var kaConfig = require('../config/kickass.js');


module.exports = {
  search: function(callback) {
    var query = 'CoCo O.T. Genasis';
    var category = kaConfig.category[1];

    kickass.search(category, query)
      .then(function(body) {
        callback(body);
      }, function(err) {
        console.log('Error:', err);
        callback({});
      });

  }
};