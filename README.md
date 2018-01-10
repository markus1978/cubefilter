# cubefilter 

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status](https://coveralls.io/repos/github/markus1978/cubefilter/badge.svg?branch=master)](https://coveralls.io/github/markus1978/cubefilter?branch=master)
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

# what does it do
tl;tr: cubefilter precomputes OLAP cubes that can be used in dc.js by exposing a crossfilter compatible API.

[dc.js](https://dc-js.github.io/dc.js/) is a great javascript library to visualize complex multidimensional
data beautifully and analytics friendly. 
dc.js is based on [crossfilter](http://crossfilter.github.io/crossfilter/), which
does all the data management, filtering, grouping and other analytics related tasks in the background.
Unfortunately, crossfilter expects all the data (i.e. facts) on client side, even though dc.js only
shows aggregated data that is usually much smaller. This imposes a natural limit on dc.js/crossfilter
and you cannot visualize arbitrarily large datasets.

cubefilter tries to solve this problem and replaces the fact-based crossfilter with a 
[OLAP cube](https://en.wikipedia.org/wiki/OLAP_cube)-based solution that exposes a similar API to
dc.js. OLAP cubes aggregate large data-sets along user defined dimensions and are usually much 
smaller than the dataset (facts) they represent. Cubefilter can be used to incrementally pre-compute
and serve cubes as simple and compact json structures on server side. On client side, cubefilter fakes
crossfilter's API to feed the aggregated cube data to  dc.js.

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

## Example
[example](http://github.com/markus1978/cubefilter/example) 
contains the code for a working example that emulates the standard
dc.js example. (Probably not the most sensible use case, but is 
demonstrates the retention of most dc.js features.)

To serve the example run
```
npm install
bower install
gulp serve
```
in the [example](http://github.com/markus1978/cubefilter/example) directory.

## Limitations
* OLAP cubes are not limited by the number of facts, but the number of
dimensions and dimension values occupied. Depending on your use case
you have to choose whether to go with crossfilter or cubefilter. 
For example, the monthly data of the dc.js example had to be omitted for a reasonable cube size.
* Dimension order used to compute and show cubes is relevant. Share
cube definition code among server and client code.
* Only one group per dimension at the moment. 

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
