module.exports = {
  db: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/loveplatform',

  localAuth: true,
  sessionSecret: "Your Session Secret goes here",

};

