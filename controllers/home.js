var _ = require('underscore');
var Note = require('../models/Note');

module.exports = function(app) {
  app.get('/', index);
};
/**
 * GET /
 * Home page.
 */
var index = function(req, res) {
  console.log(req.appConfig);
  Note.find(null, null, {limit: 9}, function(err, foundNotes) {
    res.render('home', {
       notes: foundNotes,
       config: req.appConfig
    });
  });
};
