const routeServe = require('./index')
const port = process.env.PORT || 3000

const routes = {
  '/test/foo': true,
  '/api/1': true
}

routeServe.createServer({ port, routes }, () => {
  console.log('serving:', routes)
})
