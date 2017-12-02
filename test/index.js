const request = require('superagent')
const assert = require('assert')
const routeServe = require('../index')

function jsonController (req, res) {
  const { method, url, formData } = req
  console.log(`${method}:`, url)
  res.sendJson({test: 'foo', formData})
}

const routes = {
  'GET /test/html': (req, res) => res.sendHtml('<h1>TEST</h1>'),
  'GET /test/json': jsonController,
  'POST /test/json': jsonController,
  'GET /test/error': (req, res) => { throw Error(`caught 500: ${req.url}`) }
}

const serverA = routeServe(routes)
.listen(3000, runTests(3000))

const serverB = routeServe(routes)
.listen(3001, runTests(3001))

const serverC = routeServe(routes).listen(3002, (res) => console.log('started on 3002!', res))

setTimeout(() => serverA.close(), 2000)
setTimeout(() => serverB.close(), 2000)
setTimeout(() => serverC.close(), 3000)

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
