var SpotifyApi = require('spotify-web-api-node');
var config = require('../config/app.js');
var spConfig = require('../config/spotify.js');


var spotify = {};

spotify.me = {};

spotify.api = new SpotifyApi({
  clientId: spConfig.clientId,
  clientSecret: spConfig.clientSecret,
  redirectUri: 'http://' + config.server.host + ':' + config.server.port + '/login'
});

/**
 * Create autorization url
 * @return string
 */
spotify.createAuthorizeURL = function() {
  return this.api.createAuthorizeURL(spConfig.scopes);
};

var saveAccessCode = function() {
  // https://github.com/nwjs/nw.js/wiki/Save-persistent-data-in-app
  // https://github.com/nwjs/nw.js/wiki/about-node.js-server-side-script-in-node-webkit
  // localStorage.
};

/**
 * Get ME data -  used to initiate me data for this module
 */
spotify.getMe = function(callback) {
  var that = this;

  this.api
    .getMe()
    .then(function(data) {
      that.me = data.body;
      callback(null, that.me);
    }, function(err) {
      callback(err);
    });
};

/**
 * Get ALL user playlists
 */
spotify.getPlaylists = function(userId, callback) {
  // TODO: if user has more playlsits the api allows in single request
  console.log('Spotify::getPlaylists', userId, callback);
  this.api
    .getUserPlaylists(this.me.id, {
      limit: 50,
      offset: 0
    })
    .then(
      function(data) {
        console.log(data.body.items);
        // TODO: place in session playlist data
        return callback(null, data.body.items);
      }, function(err) {
        return callback(err);
      }
    );
};

/**
 * Get ALL of LOGGED IN user playlists
 */
spotify.getMePlaylists = function(callback) {
  console.log('spotify::getMePlaylists');
  this.getPlaylists(this.me.id, callback);
};

module.exports = spotify;
