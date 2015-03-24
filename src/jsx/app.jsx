'use strict';

var spotify = require('../lib/spotify.js');

var App = React.createClass({
  render: function() {
    return (
      <div id="app">
        <AppLogin />
      </div>
    );
  }
});


// ########################################
// Login
// ########################################
var AppLogin = React.createClass({

  onClickHandler: function() {
    console.log('Logging in');
    spotify.createAuthorizeURL()

    var win = gui.Window.open(spotify.createAuthorizeURL(), {
      toolbar: false,
      frame: false,
      position: 'center',
      width: 960,
      height: 620
    });
  },

  render: function() {

    // TODO: check if logged in then redirect
    // https://github.com/nwjs/nw.js/issues/542
    // https://github.com/nwjs/nw.js/wiki/Save-persistent-data-in-app

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

React.render(<App />, document.body);