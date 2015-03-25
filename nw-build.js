// https://github.com/mllrsohn/node-webkit-builder
var NwBuilder = require('node-webkit-builder');

// Filter production modules
// ! Important to seperate dev and prod modules in package.json !
var pkg = require('./package.json');
var prodDepenencies = Object.keys(pkg.dependencies);

prodDepenencies.map(function(el, i) {
  prodDepenencies[i] = './node_modules/' + el + '/**/**';
});

buildFiles = [
  './package.json',
  './lib/**/**',
  './dist/**/**',
  './config/**/**',
  './views/**/**',
  './bower_components/**/**',
].concat(prodDepenencies);

var nw = new NwBuilder({
  files: buildFiles,
  platforms: [/*'osx32',*/ 'osx64', /*'win32', 'win64'*/]
});

//Log stuff you want
nw.on('log', console.log);

// Build returns a promise
nw.build()
  .then(function() {
    console.log('all done!');
  })
  .catch(function(error) {
    console.error(error);
  });