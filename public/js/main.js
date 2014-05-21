// @TODO most of this stuff is home page specific.  Make it only load to front page.

var prLover = {
  container: 'ul.notes',
  flashElement: '#flash',
  flashInAnimationName: 'fadeInDown',
  flashOutAnimationName: 'fadeOut',
  noteIncrementLoadLimit: 27,
  flashFinishedEvents: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',

  templateTweetLink: function(noteData) {
    var tweetLink = {
      url: this.config.shareUrl,
      text: this.config.twitter.shareText + ' ' + noteData.text,
      hashtags: this.config.twitter.shareHash,
    }
    var tweetUrl = 'https://twitter.com/intent/tweet?' + $.param(tweetLink, true);
    return tweetUrl;
  },

  templateFBLink: function(noteData) {
    //https://www.facebook.com/sharer/sharer.php?app_id=113869198637480&sdk=joey&u=http://ilovepuertorico.org&display=popup
    var fbLink = {
      app_id: this.config.fb.appId,
      sdk: 'joey',
      u: this.config.shareUrl,
      display: 'popup'
    }

    var fbUrl = 'https://www.facebook.com/sharer/sharer.php?' + $.param(fbLink, true);

    return fbUrl;
  },

  templateNoteVote: function(noteData) {
    var noteVote = '';
    if (this.config.notes.voting === true) {
      var voteCount = noteData.votes == 0 ? '' : noteData.votes;
      noteVote += '<div class="note-vote pull-left"><button type="button" data-noteid="'
        + noteData._id +
        '"  class="btn-default"><span class="vote-count">'
        + voteCount +
        '</span> <i class="fa fa-thumbs-o-up"></i></button></div>';
    }
    return noteVote;
  },

  templateNoteTwitterHandle: function(noteData) {
    noteTwitterHandle = '';
    if (noteData.twitterHandle) {
      noteTwitterHandle += "<div class='note-twitter-handle'><a href='http://twitter.com/" +
      noteData.twitterHandle + "' target='_blank'>@" + noteData.twitterHandle + "</a></div>";
    }
    return noteTwitterHandle;
  },

  templateNoteTweetLink: function(noteData) {
    var noteTweetLink = '';
    if (this.config.notes.tweeting === true) {
      var tweetUrl = this.templateTweetLink(noteData);
      noteTweetLink += '<div class="tweet-link pull-right"><a href="'
        + tweetUrl +
        '"><img src="img/bird_gray_32.png"/></a></div>';
    }
    return noteTweetLink;
  },

  templateNote: function(noteData) {
    // Template the new note.
    var newNote = "<li class='note col-md-3'><div class='note-text note-" + noteData._id + "'>" + noteData.text + "</div>";
    newNote += this.templateNoteTwitterHandle(noteData);
    newNote += this.templateNoteVote(noteData);
    newNote += this.templateNoteTweetLink(noteData);
    newNote += "</li>";

    return newNote;
  },

  templateFlash: function(flashData) {
    var flashString = '';
    flashString = flashString +
     '<div class="alert alert-' +
     flashData.type + '">' +
     flashData.message +
     '</div>';
    return flashString;
  },

  getDocHeight: function() {
    var D = document;
    return Math.max(
      Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
      Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
      Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
  },

  fadeIn: function(element) {
    $(element).addClass('animated ' + this.flashInAnimationName);
  },

  fadeOut: function(element) {
    $(element).addClass('animated ' + this.flashOutAnimationName);
  },


  fadeOutBinding: function (element) {
    // React differently based on in our out animation;
    if ($(element).hasClass(this.flashOutAnimationName)) {
      // Clear html on flash out.
      $(element).html('');
    }

    // Regardless remove animation classes.
    $(element).removeClass('animated ' + this.flashInAnimationName);
    $(element).removeClass('animated ' + this.flashOutAnimationName);
  },

  getNotes: function(options) {
    var url = 'notes/' + options.skip + '/' + options.limit;
    return $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
    });
  },

  voteOnNote: function(element) {
    var note = $(element).data('noteid');
    var _csrf = $("#new-note-form [name='_csrf']").val();
    $.ajax({
      type: "PUT",
      url: 'notes/' + $(element).data('noteid'),
      data: {
        voteCount: '+1',
        _csrf: _csrf
      },
      success: function(data) {
        if (data.changed !== false ) {
          $(element).find('.vote-count').text(data.votes);
        }
      },
    });

  },

  insertNewNotes: function(newNoteData) {
    // First Time Call.
    if (!newNoteData.requestParams.skip || newNoteData.requestParams.skip < 1) {
      $(this.container).isotope({
        itemSelector: '.note',
        // options...
        resizable: false, // disable normal resizing
        // set columnWidth to a percentage of container width
        masonry: { columnWidth: $(this.container).width() / 50 }
      });
    }
    // Last Time Call.
    if (newNoteData.notes.length < 1) {
      //container.unbind('inview');
      $(window).unbind('scroll');
      return;
    }
    // Insert notes as needed.

    var notesToAdd = '';
    for (var i = 0; i < newNoteData.notes.length; i++) {
      notesToAdd = notesToAdd + this.templateNote(newNoteData.notes[i]);
    }
    $(this.container).isotope('insert', $(notesToAdd));
    var updatedNoteCount = $(this.container).data('loadedNotes') + this.noteIncrementLoadLimit;
    $(this.container).data('loadedNotes', updatedNoteCount);
    $('.note-vote button').click(function(e) {
      prLover.voteOnNote(this);
    });
  },

  createNewNote: function() {
    // @TODO -- rework this so that validation is still done properly.
    var noteText = $('#new-note-form #noteText').val();
    var twitterHandle = $('#new-note-form #twitterHandle').val();
    var _csrf = $("#new-note-form [name='_csrf']").val();
    return $.ajax({
      type: "POST",
      url: 'note/new',
      data: {
        noteText: noteText,
        twitterHandle: twitterHandle,
        _csrf: _csrf
      }
    });
  },

  prependNewNote: function(noteData) {
    var note = this.templateNote(noteData);
    $(this.container)
      .prepend(note)
      .isotope('reloadItems')
      .isotope({ sortBy: 'original-order' });
  },

  showSharerModal: function(response) {
    if (this.config.afterSubmit.popUpSharePrompt === true) {
      var tweetUrl = this.templateTweetLink(response);
      var fbUrl = this.templateFBLink(response);
      $('.variable-modal-content').html(
        '<a class="btn btn-large" href="'
        + tweetUrl +
        '">Twitter</a><a target="_blank" class="btn btn-large" href="'
        + fbUrl +
        '">Facebook</a>');
      $('#sharer-modal').modal();
    }
  },

  init: function() {
    // Setup.
    this.config = appConfig;
    // Grab Loaded Notes
    var self = this;
    $(this.container).data('loadedNotes', 0);
    // Bind Scroll Loading.
    $(window).bind('scroll', function() {
      if ($(window).scrollTop() + $(window).height() == self.getDocHeight()) {
        self.getNotes({
          skip: $(self.container).data('loadedNotes'),
          limit: self.noteIncrementLoadLimit
        }).then(function(noteData) {
          self.insertNewNotes(noteData);
        });
      }
    });
    // Bind Smart Resize.
    // update columnWidth on window resize
    $(window).smartresize(function(){
      $(self.container).isotope({
        // update columnWidth to a percentage of container width
        masonry: { columnWidth: $(self.container).width() / 50 }
      });
    });

    // Bind Flash Finished Events.
    $(this.errorFlashContainer).bind(this.flashFinishedEvent, this.fadeOutBinding);

    $('#new-note-form .btn').click(function(event) {
      event.preventDefault;
      event.stopPropration;
      self.createNewNote().then(function(response) {
        if (!response.errors) {
          // Clear out the fields.
          $('#new-note-form #noteText').val('');
          $('#new-note-form #twitterHandle').val('');
          prLover.prependNewNote(response);
          self.showSharerModal(response);
        }
        else {
          for (var i = 0; i < response.errors.length; i ++) {
            var flashString = prLover.templateFlash({
              message: response.errors[i].msg,
              type: 'danger'
            });
            $(prLover.flashElement).append(flashString);
          }
          prLover.fadeIn(prLover.flashElement);
          setTimeout(function(){
            prLover.fadeOut(prLover.flashElement);
          }, 5000);
        }
      });
      return false;
    });
    console.log(this.config);
    // Load initial notes set.
    this.getNotes({
      skip: $(this.container).data('loadedNotes'),
      limit: this.noteIncrementLoadLimit
    }).then(function(noteData) {
      self.insertNewNotes(noteData);
    });

  }
};

$(document).ready(function() {
  prLover.init();

});


