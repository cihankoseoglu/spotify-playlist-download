/** @jsx React.DOM */
'use strict';

// Modules
var async = require('async');
var http = require('http');
var killable = require('killable');

// Config
var config = require('../../config/app.js');

// Libs
// var Spotify = require('../lib/spotify.js');
var spotify;

// ########################################
// App
// ########################################
var App = React.createClass({

  propTypes: {
    test: React.PropTypes.number
  },

  getInitialState: function() {
    return {
      loggedIn: false
    };
  },

  // function that gets called when people logged in our logged out
  loginChangeHandler: function(status) {
    console.log('App::loginChangeHandler', status);

    this.setState({
      loggedIn: status === 'LOGGED_IN'
    });
  },

  componentDidMount: function() {
    var that = this;

    spotify = new Spotify(function(err) {
      // if user is logged in
      if(!err) {
        that.loginChangeHandler('LOGGED_IN');
      }
    });

  },

  render: function() {
    return (
      <div id='app'>
        {this.state.loggedIn ? (<AppBody/>) : (<AppLogin loginChange={this.loginChangeHandler}/>)}
      </div>
    );
  }
});


// ##############################
// Login
// ##############################
var AppLogin = React.createClass({

  getInitialState: function() {
    return {
      modalOpened: false
    };
  },

  clickHandler: function() {
    var that = this;

    // prevent addition modals from opening
    if(this.state.modalOpened)
      return;

    that.setState({
      modalOpened: true
    });

    // modal window
    var modal,
        width = 960,
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

    // Create a killable web server that listens to spotify api callback uri
    // Didn't find any other way of using oauth currently was nw.js doesn't support cross-platform app protocol
    // similar what skype linkes use or spotify native app login, which makes the user expierence better
    var server = http.createServer(function(req, res) {

      // make plain response
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('╰། ͒ ▃ ͒ །╯ - don\'t worry if you see this', function() {
        // close modal
        modal.close();

        that.setState({
          modalOpened: false
        });
      });

      // parse request url and get code
      var uri = require('url').parse(req.url, true);
      var code = uri.query.code;

      async.series([

        // kill server
        function(callback) {
          server.kill(function() {
            console.log('http::server', 'killed');
            callback(null);
          });
        },

        // get authorization code
        function(callback) {
          spotify.authorizationCodeGrant(code, function(err) {
            callback(err);
          });
        },

        // load user data
        function(callback) {
          spotify.loadUserData(function(err) {
            callback(err);
          });
        }

      // end callback
      ], function(err) {
        if(err) {
          console.error(err);
          return;
        }

        // change status to logged in
        that.props.loginChange('LOGGED_IN');
      });

    }).listen(config.server.port, function() {

      // create a killable server
      killable(server);

      // open new window with spotify oauth login
      modal = gui.Window.open(Spotify.createAuthorizeURL(), winOpts);
    });

  },

  render: function() {
    return (
      <div id="login">
        <div className="background"></div>
        <div className="body">
          <h1>Music offline</h1>
          <p>All your favorite music offline</p>
          <button onClick={this.clickHandler}>Login using Spotify</button>
        </div>
      </div>
    )
  }
});


// ##############################
// Body
// ##############################
var AppBody = React.createClass({

  getInitialState: function() {
    return {
      playlists: [],
      playlist_songs: []
    };
  },

  getPlaylists: function() {
    this.setState({
      playlists: spotify.playlists
    });
  },

  componentDidMount: function() {
    this.getPlaylists();
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
        <AppNavigation />
        <AppSidebar
          openPlaylist={this.handlePlaylistOpen}
          playlists={this.state.playlists} />
        <AppBodyContent songs={this.state.playlist_songs}/>
      </div>
    );
  }
});


// ####################
// Navigation
// ####################
var AppNavigation = React.createClass({
  render: function () {
    return (
      <nav id="navigation">
        <button>Settings</button>
        <button>Logout</button>
      </nav>
    );
  }
});


// ####################
// Sidebar
// ####################
var AppSidebar = React.createClass({

  clickHandler: function(ev) {
    ev.stopPropagation();
    console.log('AppSidebar::clickHandler', ev.target.key);
    // this.props.openPlaylist(id);
  },

  render: function() {
    var that = this;
    var playlists = this.props.playlists;

    return (
      <div id="sidebar">
        {playlists.map(function(playlist) {
          return <div
            className="playlist"
            key={playlist.id}
            onClick={that.clickHandler}
            >
              {playlist.name}
            </div>;
        })}
      </div>
    );
  }
});


// ####################
// Body content
// ####################
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