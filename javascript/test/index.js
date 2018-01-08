import test from "tape";
import cubefilter from "../src";

const test_cube = {
  "a1": {
    "b1": {"_": 1},
    "b2": {"_": 2}
  }
};

test("all", (t) => {
  t.plan(1);
  const cube = cubefilter();
  cube.cube(test_cube);
  const group = cube.dimension("a").group();
  cube.dimension("b");
  t.deepEqual(group.all(), [{"key": "a1", "value": 3}], "return true")
});

test("filter", (t) => {
  t.plan(1);
  const cube = cubefilter();
  cube.cube(test_cube);
  const groupA = cube.dimension("a").group();
  const dimensionB = cube.dimension("b");
  dimensionB.filterExact("b1");
  t.deepEqual(groupA.all(), [{"key": "a1", "value": 1}], "return true")
});
