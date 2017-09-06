const http = require('http')
const urlParse = require('url').parse

let Server = null
let Routes = null

function handle404 (req, res) {
  res.writeHead(404, {'Content-Type': 'application/json'})
  const { method, url } = req
  const responseBody = { method, url, message: '404 - Not Found' }
  res.end(JSON.stringify(responseBody))
}

function requestHandler (req, res) {
  const { method, url } = req
  const URL = urlParse(url)
  const found = Routes[URL.pathname]
  const validMethod = (method === 'POST' || method === 'GET')
  // console.log(found, URL.pathname, '>>>')

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

function listen ({ port, routes }, cb) {
  Routes = routes
  Server = http.createServer(requestHandler)
  Server.listen(port, () => {
    console.log('listening on port:' + port)
    if (typeof cb === 'function') {
      cb()
    }
  })
}

function close () {
  Server.close()
}

module.exports.listen = listen
module.exports.close = close
