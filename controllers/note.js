var _ = require('underscore');
var Note = require('../models/Note');

module.exports = function(app, config) {
  app.post('/note/new', postNewNoteForm);
  app.get('/notes/:skip/:limit', getNotes);
  app.put('/notes/:note_id', updateNote);
};


/**
 * POST /note/new
 * Create a new local account.
 * @param email
 * @param password
 */
var postNewNoteForm = function(req, res, next) {
  req.assert('noteText', 'Text must be between 1 and 140 characters').len(1, 140);
  req.assert('twitterHandle', 'Twitter handle must be between 1 and 25 characters').len(1, 25);
  var errors = req.validationErrors();
  if (errors) {
    return res.send({ errors: errors });
  }
  var note = new Note({
    text: req.body.noteText,
    twitterHandle: req.body.twitterHandle
  }).save(function(err, newNote) {
    return res.send(newNote);
  });
};


/**
 * GET /notes/:skip/:limit
 * Get Notes.
 * @param req
 * @param res
 */
var getNotes = function(req, res) {
  var requestParams = {};
  var requestParams = {skip: req.params.skip, limit: req.params.limit};
  // TODO validate params incoming.
  // @TODO -- use select here to figure out unneeded params.
  Note.find(null, null, requestParams).sort({ _id: 1 }).exec(function(err, foundNotes){
    res.send({
        requestParams: requestParams,
        notes: foundNotes
    });
  });
};

/**
 * PUT /notes/:note_id
 * Update Note.
 * @param req
 * @param res
 */
var updateNote = function(req, res) {
  var query = { _id: req.params.note_id, voters: { '$ne':  req.sessionID } };
  var voteOp = req.body.voteCount;
  var update = {};
  if (voteOp == '+1'){
  	update = { '$inc': { 'votes': 1 }, '$push': { voters: req.sessionID } } ;
  }
  Note.findOneAndUpdate(query, update, {}, function (errors, updatedObject) {
    if (errors) {
      return res.send({ errors: errors });
    }
    if (updatedObject) {
      return res.send({'_changed': true, '_id': updatedObject._id, 'votes': updatedObject.votes});
    }
    return res.send({ '_changed': false });
  });

};

