const http = require('http')
const urlParse = require('url').parse

function handle404 (req, res) {
  res.writeHead(404, {'Content-Type': 'application/json'})
  const { method, url } = req
  const responseBody = { method, url, message: '404 - Not Found' }
  res.end(JSON.stringify(responseBody))
}

function Server ({ port, routes }, cb) {
  this.routes = routes
  this.port = port
  this.server = http.createServer(this.requestHandler())
  .listen(port, () => {
    console.log('listening on port:' + port)
    if (typeof cb === 'function') {
      cb()
    }
  })
}

Server.prototype.requestHandler = function () {
  const routes = this.routes

  return function (req, res) {
    const { method, url } = req
    const URL = urlParse(url)
    const found = routes[URL.pathname]
    const validMethod = (method === 'POST' || method === 'GET')

    if (validMethod && found) {
      let body = []
      req.on('error', err => {
        console.error('req Error:', err.status)
      })
    .on('data', (chunk) => {
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()
      res.on('error', err => {
        console.error('res Error: ', err.status)
      })

      // trigger route handler
      if (typeof found === 'function') {
        found(req, res)
      }

      res.writeHead(200, {'Content-Type': 'application/json'})
      const responseBody = { method, url, body }
      res.write(JSON.stringify(responseBody))
      res.end()
    })
    } else {
      handle404(req, res)
    }
  }
}

Server.prototype.close = function () {
  console.log('closing server on port:', this.port)
  return this.server.close()
}

function createServer ({ port, routes }, cb) {
  return new Server({ port, routes }, cb)
}

module.exports.createServer = createServer
module.exports.listen = createServer
