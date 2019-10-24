var express = require('express');
var router = express.Router();
var db = require('../../config/database');
var Client = require('../../models/Client');

/* GET users listing. */
router.get('/', function(req, res, next) {
  Client.findAll()
    .then(function(client) {
        console.log(client);
        res.sendStatus(200);
    })
    .catch(function(err) {
        console.log(err);
    })
});

router.get('/cool', function(req, res, next) {
  res.send('You are so cool');
});

module.exports = router;