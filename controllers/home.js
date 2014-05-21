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
  Note.find(null, null, {limit: req.appConfig.notes.displayInitial}, function(err, foundNotes) {
    res.render('home', {
       notes: foundNotes,
       config: req.appConfig
    });
  });
};
