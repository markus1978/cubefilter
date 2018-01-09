# cubefilter
tl;tr: cubefilter precomputes OLAP cubes that can be used in dc.js by exposing a crossfilter compatible API.

(dc.js)[https://dc-js.github.io/dc.js/] is a great javascript library to visualize complex multidimensional
data beautifully and analytics friendly. 
dc.js is based on (crossfilter)[http://crossfilter.github.io/crossfilter/], which
does all the data management, filtering, grouping and other analytics related tasks in the background.
Unfortunately, crossfilter expects all the data (i.e. facts) on client side, even though dc.js only
shows aggregated data that is usually much smaller. This imposes a natural limit on dc.js/crossfilter
and you cannot visualize arbitrarily large datasets.

cubefilter tries to solve this problem and replaces the fact-based crossfilter with a 
(OLAP cube)[https://en.wikipedia.org/wiki/OLAP_cube]-based solution that exposes a similar API to
dc.js. OLAP cubes aggregate large data-sets along user defined dimensions and are usually much 
smaller than the dataset (facts) they represent. Cubefilter can be used to incrementally pre-compute
and serve cubes as simple and compact json structures on server side. On client side, cubefilter fakes
crossfilter's API to feed the aggregated cube data to  dc.js.

### repository structure

Directories contain their own README.md with detailed information

* (javascript)[javascript] – client side npm package
* (python)[python] – pypi package with python-based backend implementation
* (example)[example] – working example with client and server

