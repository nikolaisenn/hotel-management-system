var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/accommodation', function(req, res, next) {
  res.render('accommodation');
});

module.exports = router;
