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

```js
const cube = cubefilter();

// set the cube data loaded from serve
cube.cube(cubeData)

// use it like crossfilter and hand dimensions and groups to dc.js
revenueDimension = cube.dimension("revenue");
revenueGroup = cube.group();
dc.pieChart("my-revenue-chart-div")
  .dimension(revenueDimension)
  .group(renvenueGroup);
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
