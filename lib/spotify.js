var SpotifyApi = require('spotify-web-api-node');

var appConfig = require('../config/app.js');
var spotifyConfig = require('../config/spotify.js');

var spotify = new SpotifyApi({
  clientId: spotifyConfig.clientId,
  clientSecret: spotifyConfig.clientSecret,
  redirectUri: 'http://' + appConfig.server.host + ':' + appConfig.server.port + '/login'
});


var me = {};

/**
 * Create autorization url
 * @return string
 */
var createAuthorizeURL = function() {
  return spotify.createAuthorizeURL(spotifyConfig.scopes);
};

var saveAccessCode = function() {
  // https://github.com/nwjs/nw.js/wiki/Save-persistent-data-in-app
  // https://github.com/nwjs/nw.js/wiki/about-node.js-server-side-script-in-node-webkit
  // localStorage.
};

/**
 * Get ALL user playlists
 */
var getPlaylists = function(userId, callback) {
  // TODO: if user has more playlsits the api allows in single request
  console.log('Spotify::getPlaylists', userId, callback);
  spotify
    .getUserPlaylists(spotify.me.id, {
      limit: 50,
      offset: 0
    })
    .then(
      function(data) {
        // TODO: place in session playlist data
        callback(null, data.body.items);
      }, function(err) {
        callback(err);
      }
    );
};

/**
 * Get ALL of LOGGED IN user playlists
 */
var getMePlaylists = function(callback) {
  console.log(getPlaylists, this.getPlaylists);
  getPlaylists(me.id, callback);
};

module.exports = {
  me: me,
  api: spotify,
  createAuthorizeURL: createAuthorizeURL,
  // saveAccessCode: saveAccessCode,
  getPlaylists: getPlaylists,
  getMePlaylists: getMePlaylists,
};

