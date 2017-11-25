# Route-Serve
experimental HTTP server with routes as objects (zero-dependency)
> built to respond to bots and IoT

[![Build Status](https://travis-ci.org/bradoyler/route-serve.svg?branch=master)](https://travis-ci.org/bradoyler/route-serve)
[![NPM Version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]

[![NPM](https://nodei.co/npm/route-serve.png?downloads=true&downloadRank=true)](https://nodei.co/npm/route-serve/) [![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Start serving routes
```js
const rs = require('route-serve')

const routes = [
  {
    method: 'GET',
    path: '/test/html',
    handler: function (req, res) {
      res.sendHtml('<h1>TEST</h1>')
    }
  },
  {
    method: 'POST',
    path: '/test/json',
    handler: (req, res) => {
      res.sendJson({test: 'foo', data: req.postData})
    }
  }
]

rs.createServer({ port: 3000, routes })
```

TODOs:
- route params, validations
- middleware
- serve static files
- multi-part form data tests

------
The MIT License (MIT)

Copyright (c) 2017 Brad Oyler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[npm-image]: https://img.shields.io/npm/v/route-serve.svg
[downloads-image]: http://img.shields.io/npm/dm/route-serve.svg
[npm-url]: https://npmjs.org/package/route-serve
