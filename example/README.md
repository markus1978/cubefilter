## Run
To serve the example run
```
npm install
bower install
gulp serve
```
in this directory.

## Explore
The [app](app) directory contains the javascript for cube definitions 
([definitions.js](app/scripts/definitions.js)) and the browser only code that
instantiates the charts with dc.js ([main.js](app/scripts/main.js)).

The [cube](cube) directory contains scripts and data that is used to
precompute the cube for this example. The node.js script [cubegen.js](cube/cubegen.js)
is executed by `gulp serve`.
