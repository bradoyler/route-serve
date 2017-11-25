const request = require('superagent')
const assert = require('assert')
const routeServe = require('../index')

const routes = [
  {
    method: 'GET',
    path: '/test/html',
    handler: function (req, res) {
      console.log('GET:', req.url)
      res.sendHtml('<h1>TEST</h1>')
    }
  },
  {
    method: 'GET',
    path: '/test/json',
    handler: (req, res) => {
      console.log('GET:', req.url)
      res.sendJson({test: 'foo'})
    }
  },
  {
    method: 'POST',
    path: '/test/foo',
    handler: function (req, res) {
      console.log('POST:', req.url, req.postData)
      res.sendJson(req.postData)
    }
  },
  {
    method: 'GET',
    path: '/test/error',
    handler: function (req, res) {
      console.log('GET:', req.url)
      throw Error('caught 500')
    }
  }
]

const serverA = routeServe.createServer({ port: 3000, routes }, runTests(3000))
const serverB = routeServe.createServer({ port: 3001, routes }, runTests(3001))

setTimeout(() => serverA.close(), 2000)
setTimeout(() => serverB.close(true), 3000)

function runTests (port) {
  return function () {
    request
      .post(`http://localhost:${port}/test/foo?test=A`)
      .send({ name: 'Brad', title: 'dev' }) // sends a JSON post body
      .set('X-API-Key', 'foobar')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          console.error('err >>', err.message)
        }
        console.log('POST - res.body:', res.body)
        assert.equal('{"name":"Brad","title":"dev"}', res.body)
      })

    request
      .get(`http://localhost:${port}/test/html`)
      .end((err, res) => {
        if (err) {
          console.error('err >>', err.message, res.body.url)
        }
        console.log('res.text >>', res.text, res.body)
        assert.equal('<h1>TEST</h1>', res.text)
      })

    request
      .get(`http://localhost:${port}/test/json`)
      .end((err, res) => {
        if (err) {
          console.error('err >>', err.message, res.body.url)
        }
        console.log('res.body >>', res.body)
        assert.equal('{"test":"foo"}', JSON.stringify(res.body))
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
