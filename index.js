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

function Server (routes) {
  return http.createServer(requestHandler(routes))
}

const requestHandler = (routes) => {
  return function (req, res) {
    // error events
    res.on('error', err => handleError(err, req, res))
    req.on('error', err => handleError(err, req, res))

    const { method, url } = req
    const URL = urlParse(url)
    const route = routes[`${method} ${URL.pathname}`]

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
      if (typeof route === 'function') {
        res.sendJson = sendJson
        res.sendHtml = sendHtml
        try {
          req.formData = qs.parse(Buffer.concat(chunks).toString('utf8'))
          route(req, res)
          return
        } catch (ex) {
          handleError(ex, req, res)
        }
      }
    })
  }
}

module.exports = Server
