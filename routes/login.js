var express = require('express');
var router = express.Router();

var spotify = require('../lib/spotify.js');

router.get('/', function(req, res, next) {

  // redirect to homepage if logged in
  if(req.session.accessToken)
    return res.redirect('/');

  // if redirected back from spotify
  if(req.query.code) {
    return spotify.api
      .authorizationCodeGrant(req.query.code)
      .then(function(data) {
        // console.log('The token expires in ' + data.expires_in);
        // console.log('The access token is ' + data.access_token);
        // console.log('The refresh token is ' + data.refresh_token);

        req.session.accessToken = data;

        // Set the access token on the API object to use it in later calls
        spotify.api.setAccessToken(data.access_token);
        spotify.api.setRefreshToken(data.refresh_token);

        return res.redirect('/');
      }, function(err) {
        return next(err);
      });

  }

  res.render('login', {
    authUrl: spotify.createAuthorizeURL()
  });
});


module.exports = router;
