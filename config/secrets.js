module.exports = {
  db: process.env.MONGOLAB_URI || 'localhost',

  localAuth: true,
  sessionSecret: "Your Session Secret goes here",

};

