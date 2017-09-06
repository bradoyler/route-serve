const request = require('superagent')
const assert = require('assert')
const server = require('../index')
const port = process.env.PORT || 3000

const routes = {
  '/test/foo': function (req, res) {
    console.log(req.url, 'hit!')
  },
  '/api/1': true
}

server.listen({ port, routes }, runTests)

// curl -d '[{foo:\"bar\"}]'  http://localhost:3000/test?foo=bar2
function runTests () {
  request
    .post(`http://localhost:${port}/test/foo?test=1`)
    .send({ name: 'Brad', title: 'dev' }) // sends a JSON post body
    .set('X-API-Key', 'foobar')
    .set('Accept', 'application/json')
    .end((err, res) => {
      if (err) {
        console.error('err >>', err.message)
        server.close()
        return
      }
      assert.equal('/test/foo?test=1', res.body.url)
      console.log('res.body.url >>', res.body.url)
    })

  request
    .get(`http://localhost:${port}/api/1`)
    .end((err, res) => {
      if (err) {
        console.error('err >>', err.message, res.body.url)
        server.close()
        return
      }
      assert.equal('/api/1', res.body.url)
      console.log('res.body.url >>', res.body.url)
    })

  request
    .get(`http://localhost:${port}/404`)
    .end((err, res) => {
      if (err) {
        console.error('err >>', err.message, err.status)
        server.close()
      }
      assert.equal(404, res.status)
    })
}
