const request = require('superagent')
const assert = require('assert')
const routeServe = require('../index')

function htmlController (req, res) {
  console.log(`${req.method}:`, req.url)
  res.sendHtml('<h1>TEST</h1>')
}

function jsonController (req, res) {
  const { method, url, formData } = req
  console.log(`${method}:`, url)
  res.sendJson({test: 'foo', formData})
}

function errorController (req, res) {
  throw Error(`caught 500: ${req.url}`)
}

const routes = [
  {
    method: 'GET',
    path: '/test/html',
    handler: htmlController
  },
  {
    method: 'GET',
    path: '/test/json',
    handler: jsonController
  },
  {
    method: 'POST',
    path: '/test/json',
    handler: jsonController
  },
  {
    method: 'GET',
    path: '/test/error',
    handler: errorController
  }
]

const serverA = routeServe.createServer({ port: 3000, routes }, runTests(3000))
const serverB = routeServe.createServer({ port: 3001, routes }, runTests(3001))

setTimeout(() => serverA.close(), 2000)
setTimeout(() => serverB.close(true), 3000)

function runTests (port) {
  return function () {
    request
      .post(`http://localhost:${port}/test/json?test=A`)
      .send({ name: 'Brad', title: 'dev' }) // sends a JSON post body
      .set('X-API-Key', 'foobar')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .end((err, res) => {
        if (err) {
          console.error('err >>', err.message)
        }
        console.log('res.body >>', res.body)
        assert.deepEqual({ test: 'foo', formData: { name: 'Brad', title: 'dev' } }, res.body)
      })

    request
      .get(`http://localhost:${port}/test/html`)
      .end((err, res) => {
        if (err) {
          console.error('err >>', err.message)
        }
        console.log('res.text >>', res.text, res.body)
        assert.equal('<h1>TEST</h1>', res.text)
      })

    request
      .get(`http://localhost:${port}/test/json`)
      .end((err, res) => {
        if (err) {
          console.error('err >>', err.message)
        }
        console.log('res.body >>', res.body)
        assert.deepEqual({test: 'foo', formData: {}}, res.body)
      })
    request
      .get(`http://localhost:${port}/404`)
      .end((err, res) => {
        if (err) {
          console.error('err >>', err.message, err.status)
        }
        assert.equal(404, res.status)
      })

    request
      .get(`http://localhost:${port}/test/error`)
      .end((err, res) => {
        if (err) {
          console.error('err >>', err.message, err.status)
        }
        assert.equal(500, res.status)
      })
  }
}
