'use strict';

var config = require('../config/app.js');
var spotify = require('../lib/spotify.js');
var async = require('async');



// ########################################
// App
// ########################################
var App = React.createClass({

  getInitialState: function() {
    return {
      loggedIn: false
    };
  },

  // function that gets called when people logged in our logged out
  loginChangeHandler: function(state) {
    this.setState({
      loggedIn: state
    });
  },

  render: function() {
    return (
      <div id="app">
        {this.state.loggedIn ? null : (<AppLogin loginChange={this.loginChangeHandler} />)}
        {this.state.loggedIn ? (<AppBody />) : null}
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
            console.log('The token expires in ' + data.body.expires_in);
            console.log('The access token is ' + data.body.access_token);
            console.log('The refresh token is ' + data.body.refresh_token);

            that.setState({
              modalOpened: false
            });

            // TODO: save data variable to session
            // https://github.com/nwjs/nw.js/wiki/Save-persistent-data-in-app

            // TODO: close server
            // https://github.com/marten-de-vries/killable

            // Set the access token on the API object to use it in later calls
            spotify.api.setAccessToken(data.body.access_token);
            spotify.api.setRefreshToken(data.body.refresh_token);

            // Save me data to object
            spotify.api
              .getMe()
              .then(function(data) {
                spotify.me = data.body;
                that.props.loginChange(true);
              }, function(err) {
                console.error(err);
              });

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
          <p>All your favorite music offline</p>
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

  getInitialState: function() {
    return {
      songs: []
    };
  },

  handlePlaylistOpen: function(ownerId , playlistId) {

    var that = this;

    console.log('playlist click');

    // TODO: if user has more songs then allowed in single request
    // Can get amount of songs by playlist.tracks.total
    spotify.api.getPlaylistTracks(ownerId, playlistId)
      .then(function(data) {
        that.setState({
          songs: data.body.items
        });
      }, function(err) {
        console.error(err);
      });
  },

  render: function() {
    return (
      <div id="body">
        <AppBodyNavigation />
        <AppBodySidebar openPlaylist={this.handlePlaylistOpen} />
        <AppBodyContent songs={this.state.songs}/>
      </div>
    );
  }
});

var AppBodyNavigation = React.createClass({

  render: function () {
    return (
      <nav id="navigation">
        <button>Settings</button>
        <button>Logout</button>
      </nav>
    );
  }
});

var AppBodySidebar = React.createClass({

  getInitialState: function() {
    return {
      playlists: []
    };
  },

  getPlaylists: function() {

    var that = this;

    console.log('Getting playlists');

    spotify.getMePlaylists(function(err, playlists) {
      if(err)
        console.error(err);

      console.log('test', playlists);
      that.setState({
        playlists: playlists
      });
    });

  },

  componentDidMount: function() {
    this.getPlaylists();
  },

  handlePlaylistClick: function(el) {
    this.props.openPlaylist(el.props.id);
  },

  render: function() {
    return (
      <div id="sidebar">
        {this.state.playlists.map(function(playlist) {
          return (
            <div
              className="playlist"
              key={playlist.id}
              onClick={this.handlePlaylistClick}
              >
              {playlist.name}
            </div>
          );
        })}
      </div>
    );
  }
});

var AppBodyContent = React.createClass({
  render: function() {
    return (
      <div id="content">
        {this.props.songs.map(function(song) {
          return (
            <div
              className="song"
              key={song.track.id}
              >
              {song.track.name}
            </div>
          );
        })}
        Playlists info goes here!
      </div>
    );
  }
});





// ########################################
// init
// ########################################
React.render(<App />, document.body);