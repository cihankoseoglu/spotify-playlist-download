var SpotifyApi = require('spotify-web-api-node');

var appConfig = require('../config/app.js');
var spotifyConfig = require('../config/spotify.js');

var spotify = new SpotifyApi({
  clientId: spotifyConfig.clientId,
  clientSecret: spotifyConfig.clientSecret,
  redirectUri: 'http://' + appConfig.server.host + ':' + appConfig.server.port + '/login'
});


var createAuthorizeURL = function() {
  return spotify.createAuthorizeURL(spotifyConfig.scopes);
};

var saveAccessCode = function() {
  // https://github.com/nwjs/nw.js/wiki/Save-persistent-data-in-app
  // https://github.com/nwjs/nw.js/wiki/about-node.js-server-side-script-in-node-webkit
  // localStorage.
};

module.exports = {
  api: spotify,
  createAuthorizeURL: createAuthorizeURL,
  saveAccessCode: saveAccessCode,
};

