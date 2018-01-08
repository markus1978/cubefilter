import json
from collections import OrderedDict


class Cube(object):
    def __init__(self, dimensions):
        super().__init__()
        self.dimensions = dimensions
        self.cube = {}
        self.dictionaries = {}

        self._current_cells = {}  # a dictionary dim->cell for the current fact

    @staticmethod
    def _get(fact, key):
        if callable(key):
            return key(fact)
        else:
            return fact[key]

    @staticmethod
    def _value(fact, dimension):
        """
        Extract dimension value from fact.
        :param fact: The fact object, i.e. dict.
        :param dimension: The dimension specification.
        :returns: Tuple with the object that the values was directly taken from and the value.
        """
        # determine parent based on parent key or parent function
        if "parent" in dimension:
            parent = Cube._get(fact, dimension["parent"])
        else:
            parent = fact

        # use value function if there is one
        if callable(dimension["value"]):
            return parent, dimension["value"](parent)

        # determine parent based on qualified value key
        key = dimension["value"]
        key_items = key.split(".")
        for key_item in key_items[:-1]:
            if parent is None:
                break
            parent = parent[key_item]

        # determine value
        if parent is None:
            value = None
        else:
            value = parent[key_items[-1]]

        return parent, value

    @staticmethod
    def _normalize(value):
        str_value = str(value)
        return str_value.replace("$", "&#FF04;").replace(".", "&#FF0E;")

    def _cell(self, fact):
        cell = self.cube
        for dimension in self.dimensions:
            parent, value = self._value(fact, dimension)
            value = self._normalize(value)
            self._current_cells[dimension["name"]] = cell, value
            is_new = value not in cell
            cell = cell.setdefault(value, {})

            if value is not None and is_new and "dictionary" in dimension:
                dictionary_spec = dimension["dictionary"]
                dictionary = self.dictionaries.setdefault(dictionary_spec["dictionary"], {})
                dictionary_key = self._normalize(self._get(parent, dictionary_spec["key"]))
                dictionary[dictionary_key] = self._get(parent, dictionary_spec["value"])

        return cell

    def add_fact(self, fact):
        cell = self._cell(fact)
        current = cell.get("_", 0)
        cell["_"] = current + 1

    def remove_fact(self, fact):
        cell = self._cell(fact)
        current = cell.get("_", 0)
        if current == 0:
            # TODO clients should be warned about this situation
            pass
        cell["_"] = current - 1

        if current == 1:
            # the cell is empty now, it can be removed
            del(cell["_"])
            for dimension in reversed(self.dimensions):
                if len(cell) == 0:
                    parent_cell, value = self._current_cells[dimension["name"]]
                    del(parent_cell[value])
                    cell = parent_cell
                else:
                    break

    def to_json(self):
        data = OrderedDict(dimensions=[dimension["name"] for dimension in self.dimensions],
                           cube=self.cube, dictionaries=self.dictionaries)
        return json.dumps(data, indent=2)

