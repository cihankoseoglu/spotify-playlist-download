var express = require('express');
var router = express.Router();
var async = require('async');

var spotify = require('../lib/spotify.js');


router.get('/', function(req, res, next) {

  var userdata, playlists;

  async.series([
    function getUserData(callback) {
      spotify.api
        .getMe()
        .then(function(data) {
          userdata = data;
          callback(null);
        }, function(err) {
          callback(err);
        });
    },

    function getUserPlaylists(callback) {
      // TO-DO if user has more playlsits the api allows in single request
      spotify.api
        .getUserPlaylists(userdata.id, {
          limit: 50,
          offset: 0
        })
        .then(function(data) {
          playlists = data.items;
          callback(null, data);
        },function(err) {
          callback(err);
        });
    },

    // set songs for each playlist
    function getAllPlaylistSongs(callback) {

      // TEMPORARY
      playlists = playlists.splice(0, 1);

      async.each(playlists, function getPlaylistSongs(playlist, callback2) {

        console.log('fetching data');

        // TO-DO if user has more songs then allowed in single request
        // Can get amount of songs by playlist.tracks.total
        spotify.api.getPlaylistTracks(playlist.owner.id, playlist.id)
          .then(function(data) {
            playlist.songs = data.items;
            callback2();
          }, function(err) {
            playlist.songs = [];
            callback2(err);
          });
      }, function(err) {
        callback();
      });
    }

  ], function(err, results) {
    // if(err)
    //   return next(err);

    console.log(playlists[0].songs[0].track);
    console.log(playlists[0].songs[0].track.artists);

    req.session.userdata = userdata;
    req.session.playlists = playlists;

    res.render('index', {
      title: 'Hello',
      playlists: playlists
    });
  });

});

module.exports = router;
