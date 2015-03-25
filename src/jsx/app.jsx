'use strict';

var config = require('../config/app.js');
var spotify = require('../lib/spotify.js');



// ########################################
// Login
// ########################################
var App = React.createClass({
  render: function() {
    return (
      <div id="app">
        <AppLogin />
        <AppBody />
      </div>
    );
  }
});



// ########################################
// Login
// ########################################
var AppLogin = React.createClass({

  getInitialState: function() {
    return {
      modalOpened: false
    }
  },

  onClickHandler: function() {

    var that = this;

    // Prevent addition modals from opening
    if(this.state.modalOpened)
      return;

    that.setState({
      modalOpened: true
    });

    // modal window
    var win;

    var width = 960,
        height = 620;

    var winOpts = {
      toolbar: false,
      frame: false,
      position: 'center',
      width: width,
      height: height,
      min_width: width,
      min_height: height,
      max_width: width,
      max_height: height
    };

    // Create web server that listens to spotify api response
    var server = require('http').createServer(function(req, res) {

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Herro', function() {
        win.close();
      });

      // parse request url and get code
      var uri = require('url').parse(req.url, true);
      var code = uri.query.code;

      if(code) {
        return spotify.api
          .authorizationCodeGrant(code)
          .then(function(data) {
            console.log('The token expires in ' + data.expires_in);
            console.log('The access token is ' + data.access_token);
            console.log('The refresh token is ' + data.refresh_token);

            that.setState({
              modalOpened: false
            });

            // TODO: save data variable to session
            // https://github.com/nwjs/nw.js/wiki/Save-persistent-data-in-app

            // TODO: close server
            // https://github.com/marten-de-vries/killable

            // Set the access token on the API object to use it in later calls
            spotify.api.setAccessToken(data.access_token);
            spotify.api.setRefreshToken(data.refresh_token);

          }, function(err) {
            // TODO: display error
          });
      } else {
        // TODO: display error
      }

    }).listen(config.server.port, function() {
      // open new iframe with oauth with spotify oauth login
      win = gui.Window.open(spotify.createAuthorizeURL(), winOpts);
    });

  },

  render: function() {

    // TODO: check if logged in then redirect

    return (
      <div id="login">
        <div className="background"></div>
        <div className="body">
          <h1>Music offline</h1>
          <p>All your music offline</p>
          <button onClick={this.onClickHandler}>Login using Spotify</button>
        </div>
      </div>
    )
  }
});



// ########################################
// Body
// ########################################
var AppBody = React.createClass({
  render: function() {
    return (
      <div id="body">
        <AppBodySidebar />
        <AppBodyContent />
      </div>
    );
  }
});



var AppBodySidebar = React.createClass({
  render: function() {
    return (
      <div id="sidebar">
        List of Playlists goes here!
      </div>
    );
  }
});

var AppBodyContent = React.createClass({
  render: function() {
    return (
      <div id="content">
        Playlists info goes here!
      </div>
    );
  }
});





// ########################################
// init
// ########################################
React.render(<App />, document.body);