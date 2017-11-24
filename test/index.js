const request = require('superagent')
const assert = require('assert')
const routeServe = require('../index')
const portA = process.env.PORT || 3000
const portB = process.env.PORT || 3001

const routes = {
  '/test/foo': function (req, res) {
    console.log(req.url, 'hit!')
  },
  '/api/1': true
}

const serverA = routeServe.createServer({ port: portA, routes }, runTestA)
const serverB = routeServe.createServer({ port: portB, routes }, runTestB)

// curl -d '[{foo:\"bar\"}]'  http://localhost:3000/test?foo=bar2
function runTestA () {
  request
    .post(`http://localhost:${portA}/test/foo?test=A`)
    .send({ name: 'Brad', title: 'dev' }) // sends a JSON post body
    .set('X-API-Key', 'foobar')
    .set('Accept', 'application/json')
    .end((err, res) => {
      if (err) {
        console.error('err >>', err.message)
        serverA.close()
        return
      }
      assert.equal('/test/foo?test=A', res.body.url)
      console.log('res.body.url >>', res.body.url)
    })

  request
    .get(`http://localhost:${portA}/api/1`)
    .end((err, res) => {
      if (err) {
        console.error('err >>', err.message, res.body.url)
        serverA.close()
        return
      }
      assert.equal('/api/1', res.body.url)
      console.log('res.body.url >>', res.body.url)
    })

  request
    .get(`http://localhost:${portA}/404`)
    .end((err, res) => {
      if (err) {
        console.error('err >>', err.message, err.status)
        serverA.close()
      }
      assert.equal(404, res.status)
    })
}

function runTestB () {
  request
    .post(`http://localhost:${portB}/test/foo?test=B`)
    .send({ name: 'Brad', title: 'dev' }) // sends a JSON post body
    .set('X-API-Key', 'foobar')
    .set('Accept', 'application/json')
    .end((err, res) => {
      if (err) {
        console.error('err >>', err.message)
        serverB.close()
        return
      }
      assert.equal('/test/foo?test=B', res.body.url)
      console.log('res.body.url >>', res.body.url)
    })

  request
    .get(`http://localhost:${portB}/api/1`)
    .end((err, res) => {
      if (err) {
        console.error('err >>', err.message, res.body.url)
        serverB.close()
        return
      }
      assert.equal('/api/1', res.body.url)
      console.log('res.body.url >>', res.body.url)
    })

  request
    .get(`http://localhost:${portB}/404`)
    .end((err, res) => {
      if (err) {
        console.error('err >>', err.message, err.status)
        serverB.close()
      }
      assert.equal(404, res.status)
    })
}
