## Core
- [x] Setup GULP
- [ ] Setup testing && write unit tests using [CHAI](https://github.com/chaijs/chai) + [MOCHA](https://github.com/mochajs/mocha)
- [x] Add Travis-ci support
- [x] Try out React.js
~~- [ ] Try out Browserify.js~~
- [x] Convert from an web-application to an desktop-application using [nw.js](https://github.com/nwjs/nw.js/)
- [ ] Make file for app compilation?
~~- [ ] Try out [6to5](https://github.com/6to5/6to5)?~~
- [ ] Local database

## Features
- Spotify api
    - [x] Login
    - [x] Get user playlists
    - [x] Get songs of a playlist
    - [x] Get album,artist info of a song
    - [ ] Listening to playlist changes
    - [ ] Ability to paste playlist url
- Search
    - [ ] Multiple torrent tracker support
    - [ ] Add abilty to search for album
    - [ ] Add abilty to find a song inside of torrent
    - [ ] Community driven right song choosing?
- Download
    - [ ] Add abilty to download invidvidual song from torrent
    - [ ] Option to choose audio quality - compressed, raw, etc..


## Refactor gulp to export app assets

- node_modules (only production modules)
- bower_components (create build)
- lib
- dist
- package.json