// const crossfilter = require('crossfilter');
//
// exports.cubefilter = cubefilter;
// exports.cubefilter.quicksort = crossfilter.quicksort;
// exports.cubefilter.version = '0.0.1';

export default function cubefilter() {
  const cubefilter = {
    dimension: dimension,
    cube: set_cube,

    _dimensions: [],
    _cube: null
  };

  function set_cube(cube) {
    cubefilter._cube = cube;
  }

  function dimension(value, name) {
    const dimension = {
      filter: filter,
      filterExact: filterExact,
      filterRange: null,
      filterFunction: filterFunction,
      filterAll: filterAll,
      top: null,
      bottom: null,
      group: group,
      groupAll: null,
      dispose: null,
      remove: null, // for backwards-compatibility
      accessor: null,
      id: function() { return id; },

      _name: name,
      _value: value,
      _group: null,
      _filter: () => true,
    };

    cubefilter._dimensions.push(dimension);

    function filter(filter) {
      if (!filter) {
        filterAll();
      } else {
        throw "Not implemented";
      }
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
      const group = {
        top: null,
        all: all,
        reduce: null,
        reduceCount: null,
        reduceSum: null,
        order: null,
        orderNatural: null,
        size: null,
        dispose: null,
        remove: null, // for backwards-compatibility
        filter: filter,

        _filter: () => true,
      };

      function filter(filter) {
        group._filter = filter;
        return group;
      }

      if (dimension._group) {
        throw "Only one group per dimension allowed.";
      }
      dimension._group = group;

      function all() {
        function visit_cube(visitor) {
          for (const value in cubefilter._cube) {
            visit_cell(visitor, cubefilter._cube[value], value, 0, true);
          }
        }

        function visit_cell(visitor, cell, value, dimension_index, already_filtered) {
          const dimension = cubefilter._dimensions[dimension_index];
          const filtered = dimension._filter(value) || group === dimension._group;

          let cell_size = 0;
          if ((dimension_index + 1) < cubefilter._dimensions.length) {
            for (const next_value in cell) {
              cell_size += visit_cell(visitor, cell[next_value], next_value, dimension_index + 1, already_filtered && filtered);
            }
          } else {
            cell_size = cell["_"];
          }

          if (!filtered || !already_filtered) {
            cell_size = 0;
          }

          visitor(value, cell_size, dimension);

          return cell_size;
        }

        const result = [];
        visit_cube((value, aggr_size, visited_dimension) => {
          if (visited_dimension === dimension) {
            if (group._filter(value)) {
              const current = result[value];
              if (current) {
                result[value] = current + aggr_size;
              } else {
                result[value] = aggr_size;
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
