const url = require('url')

const makeFullUrl = (req) =>
  url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl
  })

exports.makeFullUrl = makeFullUrl
