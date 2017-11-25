const routeServe = require('../index')
const port = process.env.PORT || 3000

const routes = [
  {
    method: 'GET',
    path: '/test/html',
    handler: function (req, res) {
      console.log(req.url)
      res.sendHtml('<h1>TEST</h1>')
    }
  },
  {
    method: 'GET',
    path: '/test/json',
    handler: (req, res) => {
      console.log(req.url)
      res.sendJson({test: 'foo'})
    }
  },
  {
    method: 'POST',
    path: '/test/foo',
    handler: function (req, res) {
      console.log(req.url, 'hit!')
      res.sendJson({test: '??', data: req.postData})
    }
  },
  {
    method: 'GET',
    path: '/test/error',
    handler: function (req, res) {
      console.log(req.url)
      throw Error('caught 500')
    }
  }
]

routeServe.createServer({ port, routes }, () => {
  console.log('serving:', routes)
})
