const http = require('http')
const qs = require('querystring')
const urlParse = require('url').parse

function handle404 (req, res) {
  res.writeHead(404, {'Content-Type': 'application/json'})
  const { method, url } = req
  const responseBody = { method, url, message: '404 - Not Found' }
  res.end(JSON.stringify(responseBody))
}

function handleError (err, req, res) {
  console.error('handleError()', err)
  res.writeHead(500, {'Content-Type': 'application/json'})
  const { method, url } = req
  res.end(JSON.stringify({ method, url, message: '500 - Error occured' }))
}

function sendJson (json) {
  this.writeHead(200, {'Content-Type': 'application/json'})
  this.write(JSON.stringify(json))
  this.end()
}

function sendHtml (html) {
  this.writeHead(200, {'Content-Type': 'text/html'})
  this.write(html)
  this.end()
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
    // error events
    res.on('error', err => handleError(err, req, res))
    req.on('error', err => handleError(err, req, res))

    const { method, url } = req
    const URL = urlParse(url)
    const route = routes.find(r => r.path === URL.pathname && r.method === method)

    // validate route path
    if (!route) {
      return handle404(req, res)
    }

    let chunks = []
    req.on('data', chunk => {
      chunks.push(chunk)
      if (chunks.length > 1e6) { // kill large uploads
        res.writeHead(413, {'Content-Type': 'text/plain'}).end()
        req.connection.destroy()
      }
    })

    req.on('end', () => {
      if (typeof route.handler === 'function') {
        res.sendJson = sendJson
        res.sendHtml = sendHtml
        try {
          req.formData = qs.parse(Buffer.concat(chunks).toString('utf8'))
          route.handler(req, res)
          return
        } catch (ex) {
          handleError(ex, req, res)
        }
      }
    })
  }
}

Server.prototype.close = function (exitProcess) {
  console.log('closing server on port:', this.port)
  if (exitProcess) {
    console.log('exiting process:', process.pid)
    return process.exit()
  }
  return this.server.close()
}

function createServer ({ port, routes }, cb) {
  return new Server({ port, routes }, cb)
}

module.exports.createServer = createServer
module.exports.listen = createServer
