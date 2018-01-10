# cubefilter client library

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

This is the client side code for cubefilter. It emulates the (crossfilter)[http://crossfilter.github.io/crossfilter/] 
API se it can be used to feed pre-computed OLAP data with (dc.js)[https://dc-js.github.io/dc.js/].

## Install

```sh
npm i --save cubefilter
```

## Usage
Cubefilter can be used both on the serve in node.js and in the browser 
via standard script tags.

### Server
Here we want to pre compute cubes via node.js scripts 
to later serve them as static .json files.
```js
const cubefilter = require('cubefilter');
const sales = cubefilter.cube();
```

Then we need to define dimensions and groups that will define the OLAP cube
structure.
```js
sales.dimension(d => d.date.month);
sales.dimension(d => d.user.country);
sales.dimension(d => d.category).group().reduceSum(d.price);
```

Then we can add our facts to the cube.
```js
mySales.forEach(fact => sales.add(fact));
```

And save the cube to .json
```js
const jsonfile = require('jsonfile');
jsonfile.writeFile('sales-cube.json', sales.cube);
```

### Client
Here we want to use pre computed cubes and visualize them with dc.js.
Please refer to the dc.js documentation for details. 

Be aware to use the same dimension and group definitions. The order in which
dimensions are created is important. 
The best strategy is to use the same 'definitions.js' both 
on the server (e.g. node.js) and the browser.

The major different to standard dc.js: you do not add facts, but use
pre computed and loaded cube data. E.g. with something like this:
```js
d3.json('sales-cube.json', (data) => {
    // import sales definition
    // ...
    // set the loaded cube       
    sales.cube = data;        
    // dc.js chart code
    // ...
    // render all charts
    dc.renderAll();
});
```

See [example](http://github.com/markus1978/cubefilter/example) for a working example.

## License

MIT © [Markus Scheidgen](http://github.com/markus1978)

[npm-url]: https://npmjs.org/package/cubefilter
[npm-image]: https://img.shields.io/npm/v/cubefilter.svg?style=flat-square

[travis-url]: https://travis-ci.org/markus1978/cubefilter
[travis-image]: https://img.shields.io/travis/markus1978/cubefilter.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/markus1978/cubefilter
[coveralls-image]: https://img.shields.io/coveralls/markus1978/cubefilter.svg?style=flat-square

[depstat-url]: https://david-dm.org/markus1978/cubefilter
[depstat-image]: https://david-dm.org/markus1978/cubefilter.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/cubefilter.svg?style=flat-square
