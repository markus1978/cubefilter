## Run
To serve the example run
```
yarn
gulp serve
```
in this directory.

## Explore
The [src](src) directory contains the javascript for cube definitions 
([definitions.js](src/_scripts/definitions.js)) and the browser only code that
instantiates the charts with dc.js ([main.js](src/_scripts/main.js)).

The [cube](cube) directory contains scripts and data that is used to
precompute the cube for this example. The node.js script [cubegen.js](cube/cubegen.js)
is executed by `gulp serve`.
