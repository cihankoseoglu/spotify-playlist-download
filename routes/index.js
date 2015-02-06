var express = require('express');
var router = express.Router();

var spotify = require('../lib/spotify.js');


getMe = function(callback) {
  spotify.api
    .getMe()
    .then(function(data) {
      return callback(null, data);
    }, function(err) {
      return callback(err);
    });
};

/* GET home page. */
router.get('/', function(req, res, next) {

  getMe(function(err, data) {
    if(err)
      return next(err);

    var userId = data.id;

    spotify.api
      .getUserPlaylists(userId, {
        limit: 50,
        offset: 0
      })
      .then(function(data) {
        console.log('Retrieved playlists', data);

        res.render('index', {
          title: 'Hello',
          playlists: data.items
        });
      },function(err) {
        return next(err);
      });


  });

});

module.exports = router;
