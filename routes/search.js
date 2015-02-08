var express = require('express');
var router = express.Router();

var kickass = require('../lib/search.js');

router.get('/', function(req, res, next) {
  kickass.search(function(data) {
    res.send(JSON.stringify(data));
  });
});

module.exports = router;
