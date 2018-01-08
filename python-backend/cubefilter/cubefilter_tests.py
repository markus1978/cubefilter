import json
import unittest

from cubefilter import Cube


class CubefilterTests(unittest.TestCase):
    def test_plain_add(self):
        dimensions = [
            {
                "name": "dim1",
                "value": "a"
            }
        ]
        cube = Cube(dimensions)
        cube.add_fact({"a": "v1"})

        self.assertEqual({"v1": {"_": 1}}, cube.cube)

    def test_function_add(self):
        dimensions = [
            {
                "name": "dim1",
                "value": lambda fact: fact["a"]
            }
        ]
        cube = Cube(dimensions)
        cube.add_fact({"a": "v1"})

        self.assertEqual({"v1": {"_": 1}}, cube.cube)

    def test_parent_qualified(self):
        dimensions = [
            {
                "name": "dim1",
                "value": "p.a"
            }
        ]
        cube = Cube(dimensions)
        cube.add_fact({"p": {"a": "v1"}})

        self.assertEqual({"v1": {"_": 1}}, cube.cube)

    def test_parent(self):
        dimensions = [
            {
                "name": "dim1",
                "parent": "p",
                "value": "a"
            }
        ]
        cube = Cube(dimensions)
        cube.add_fact({"p": {"a": "v1"}})

        self.assertEqual({"v1": {"_": 1}}, cube.cube)

    def test_parent_function(self):
        dimensions = [
            {
                "name": "dim1",
                "parent": lambda fact: fact["p"],
                "value": "a"
            }
        ]
        cube = Cube(dimensions)
        cube.add_fact({"p": {"a": "v1"}})

        self.assertEqual({"v1": {"_": 1}}, cube.cube)

    def test_multi_dim(self):
        dimensions = [
            {"name": key, "value": key} for key in ["a", "b", "c"]
        ]
        cube = Cube(dimensions)
        cube.add_fact({"a": "v1", "b": "v2", "c": "v3"})

        self.assertEqual({"v1": {"v2": {"v3": {"_": 1}}}}, cube.cube)

    def test_multi_value(self):
        dimensions = [
            {
                "name": "dim1",
                "value": "a"
            }
        ]
        cube = Cube(dimensions)
        cube.add_fact({"a": "v1"})
        cube.add_fact({"a": "v2"})
        cube.add_fact({"a": "v1"})

        self.assertEqual({"v1": {"_": 2}, "v2": {"_": 1}}, cube.cube)

    def test_remove(self):
        dimensions = [
            {
                "name": "dim1",
                "value": "a"
            }
        ]
        cube = Cube(dimensions)
        cube.add_fact({"a": "v1"})
        cube.remove_fact({"a": "v1"})

        self.assertEqual({}, cube.cube)

    def test_dictionary(self):
        dimensions = [
            {
                "name": "dim1",
                "value": "a",
                "dictionary": {
                    "dictionary": "mydict",
                    "key": "a",
                    "value": "b"
                }
            }
        ]
        cube = Cube(dimensions)
        cube.add_fact({"a": "v1", "b": "label"})

        self.assertEqual({"v1": {"_": 1}}, cube.cube)
        self.assertEqual({"mydict": {"v1": "label"}}, cube.dictionaries)

    def test_tojson(self):
        dimensions = [
            {
                "name": "dim1",
                "value": lambda fact: fact["a"]
            }
        ]
        cube = Cube(dimensions)
        cube.add_fact({"a": "v1"})

        self.assertEqual({"dimensions": ["dim1"], "cube": {"v1": {"_": 1}}, "dictionaries": {}}, json.loads(cube.to_json()))


if __name__ == "__main__":
    suite = unittest.TestSuite()
    suite.addTest(unittest.defaultTestLoader.loadTestsFromName(__name__))
    result = unittest.TextTestRunner(verbosity=0).run(suite)

