(function(exports) {  // allow usage in node.js and (non browserify) browsers
  exports.cube = function(cube) {

    const cubefilter = {
      dimension: dimension,
      add: addFact,
      remove: removeFact,
      groupAll: groupAll,
      size: size,

      cube: cube || {},
      _dimensions: []
    };

    function addOrRemoveFact(fact, add) {
      // find/create the right cell based on dimensions and keep the path
      let cell = cubefilter.cube;
      let path; // neccessary for delete
      if (!add) path = new Array(cubefilter._dimensions.length);
      for (let i = 0; i < cubefilter._dimensions.length; i++) {
        const dimension = cubefilter._dimensions[i];
        const value = dimension._value(fact);
        cell[value] = cell[value] || {};
        if (!add) path[i] = { cell: cell, value: value };
        cell = cell[value];
      }

      // run all group reductions for each dimension
      if (add) {
        cell["_"] = (cell["_"] || 0) + 1;
      } else {
        cell["_"]--;
      }
      for (let i = 0; i < cubefilter._dimensions.length; i++) {
        dimension = cubefilter._dimensions[i];
        if (!dimension._group._isCount) {
          cell["_g"] = cell["_g"] || {};
          const group_values = cell["_g"];
          let group_value = group_values[i];
          if (!group_value) {
            const reduceInit = dimension._group._reduceInit;
            group_value = reduceInit();
          }
          const reduce = add ? dimension._group._reduceAdd : dimension._group._reduceRemove;
          group_value = reduce(group_value, fact);
          group_values[i] = group_value;
        }
      }

      // remove cell if empty
      if (!add) {
        if (cell["_"] === 0) {
          delete cell["_"];
        }
        for (let i = cubefilter._dimensions.length - 1; i >= 0; i--) {
          const empty = Object.keys(cell).length === 0;
          cell = path[i].cell;
          if (empty) {
            delete cell[path[i].value];
          }
        }
      }
    }

    function addFact(fact) {
      addOrRemoveFact(fact, true);
    }

    function removeFact(fact) {
      addOrRemoveFact(fact, false);
    }

    function size(cell) {
      cell = cell || cubefilter.cube;
      let n = 0;
      for (let key in cell) {
        n += size(cell[key]);
      }
      n += cell["_"] || 0;
      return n;
    }

    function groupAll() {
      // implemented with fake cardinality 1 dimension
      const all = dimension(() => "_a").group();
      all.value = () => all.all()[0].value;
      return all;
    }

    function dimension(value) {
      const dimension = {
        filter: filter,
        filterExact: filterExact,
        filterRange: filterRange,
        filterFunction: filterFunction,
        filterAll: filterAll,
        top: null,
        bottom: null,
        group: group,
        groupAll: null,
        dispose: null,
        remove: null, // for backwards-compatibility
        accessor: null,

        _group: null,
        _value: value,
        _filter: () => true,
      };

      cubefilter._dimensions.push(dimension);
      dimension.group(); // initialize with empty counting group

      function filter(filter) {
        if (!filter) {
          filterAll();
        } else if ( Object.prototype.toString.call(filter) === '[object Array]') {
          filterRange(filter)
        } else if (filter instanceof Function) {
          filterFunction(filter);
        } else {
          filterExact(filter);
        }
        return dimension;
      }

      function filterRange(filter) {
        dimension._filter = (value) => {
          return value >= filter[0] && value <= filter[1];
        };
        return dimension;
      }

      function filterFunction(filter) {
        dimension._filter = filter;
        return dimension;
      }

      function filterExact(filter_value) {
        dimension._filter = (value) => {
          return filter_value === value;
        };
        return dimension;
      }

      function filterAll() {
        dimension._filter = () => true;
        return dimension;
      }

      function group() {
        if (dimension._group) {
          return dimension._group;
        }

        const group = {
          top: null,
          all: all,
          reduce: reduce,
          reduceCount: reduceCount,
          reduceSum: reduceSum,
          order: null,
          orderNatural: null,
          size: null,
          dispose: null,
          remove: null, // for backwards-compatibility
          filter: filter,

          _filter: () => true,
          _isCount: true
        };
        dimension._group = group;

        reduceCount(); // init group with reduce count as default

        function reduce(add, remove, init, aggr) {
          group._reduceInit = init;
          group._reduceAdd = add;
          group._reduceRemove = remove;
          group._reduceAggr = aggr;
          group._isCount = false;
          return group;
        }

        function reduceCount() {
          reduce((i) => i + 1, (i) => i - 1, () => 0, (p, v) => p + v);
          group._isCount = true;
          return group;
        }

        function reduceSum(value) {
          return reduce((p, v) => p + value(v), (p, v) => p - value(v), () => 0, (p, v) => p + v);
        }

        function filter(filter) {
          group._filter = filter;
          return group;
        }

        function all() {
          function visit_cube(visitor) {
            for (const value in cubefilter.cube) {
              visit_cell(visitor, cubefilter.cube[value], value, 0, true);
            }
          }

          function aggr_cell_value(one, two) {
            if (!two) {
              return one;
            } else {
              return dimension._group._reduceAggr(one, two);
            }
          }

          function visit_cell(visitor, cell, value, dimension_index, already_filtered) {
            const visited_dimension = cubefilter._dimensions[dimension_index];
            const filtered = visited_dimension._filter(value) || group === visited_dimension._group;

            let cell_value = null;
            if ((dimension_index + 1) < cubefilter._dimensions.length) {
              for (const next_value in cell) {
                const next_cell_value = visit_cell(visitor, cell[next_value], next_value, dimension_index + 1, already_filtered && filtered);
                if (next_cell_value) {
                  cell_value = aggr_cell_value(next_cell_value, cell_value);
                }
              }
            } else {
              if (dimension._group._isCount) {
                cell_value = cell["_"];
              } else {
                cell_value = cell["_g"][cubefilter._dimensions.indexOf(dimension)];
              }
            }

            if (!filtered || !already_filtered) {
              cell_value = null;
            }

            visitor(value, cell_value, visited_dimension);

            return cell_value;
          }

          const result = [];
          visit_cube((value, aggr_value, visited_dimension) => {
            if (visited_dimension === dimension && aggr_value) {
              if (group._filter(value)) {
                const current = result[value];
                if (current) {
                  result[value] = aggr_cell_value(current,  aggr_value);
                } else {
                  result[value] = aggr_value;
                }
              }
            }
          });

          const list = [];
          for (const value in result) {
            list.push({
              key: value,
              value: result[value]
            })
          }

          return list;
        }

        return group;
      }

      return dimension;
    }

    return cubefilter;
  }
})(typeof exports === 'undefined'? this['cubefilter']={}: exports);

