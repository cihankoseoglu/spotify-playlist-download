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


// ##############################
// Login
// ##############################
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

            spotify.getMe(function(err, data) {
              // TODO: dispaly error
              if(err)
                console.error(err);

              that.props.loginChange(true);
            });

          }, function(err) {
            // TODO: display error
            console.error(err);
          });
      } else {
        // TODO: display error
        console.error('Response with no code');
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


// ##############################
// Body
// ##############################
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
        <AppNavigation />
        <AppSidebar openPlaylist={this.handlePlaylistOpen} />
        <AppBodyContent songs={this.state.songs}/>
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

  getInitialState: function() {
    return {
      children: []
    };
  },

  getPlaylists: function() {

    var that = this;

    spotify.getMePlaylists(function(err, playlists) {
      if(err)
        console.error(err);

      that.setState({
        children: playlists
      });
    });

  },

  componentDidMount: function() {
    this.getPlaylists();
  },

  elementClickHandler: function(id) {
    console.log('AppSidebar::elementClickHandler', id);
    this.props.openPlaylist(id);
  },

  render: function() {

    // var playlists = this.state.children.map(function(playlist, i) {
    //   console.log(2, playlist.id, playlist.name);
    //   // return <div>i</div>;
    //   // return <AppSidebarElement key={playlist.id} {...playlist} onElementClick={this.elementClickHandler} />;
    //   return <AppSidebarElement key={playlist.id} name={playlist.name}/>;
    // });

    // console.log(2, playlist, playlist.id, playlist.name, typeof playlist, playlist.constructor.name);

    var children = this.state.children;
    console.log(children);

    // onElementClick={this.elementClickHandler}

    return (
      <div id="sidebar">
        {children.map(function(playlist) {
          return <AppSidebarElement key={playlist.id} name={playlist.name}/>;
        })}
      </div>
    );
  }
});

var AppSidebarElement = React.createClass({

  clickHandler: function(ev) {
    ev.stopPropagation();
    console.log('AppSidebarElement::clickHandler', this.props.id);
    this.props.onElementClick(this.props.id);

    // onClick={this.clickHandler}
  },

  render: function() {
    console.log("sidebar el");
    return (
      <div className="playlist" >
        {this.props.name}
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