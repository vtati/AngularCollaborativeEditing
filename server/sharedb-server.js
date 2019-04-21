var ShareDB = require('sharedb');

ShareDB.types.register(require('rich-text').type);

module.exports = new ShareDB({
  db: require('sharedb-mongo')(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')
});
