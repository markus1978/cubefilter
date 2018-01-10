const test =require("tape");
const cubefilter = require("../src/index.js");

const test_cube = {
  "a1": {
    "b1": {"_": 1},
    "b2": {"_": 2}
  }
};

const test_facts = [
  { "a": "a1", "b": "b1" },
  { "a": "a2", "b": "b2" }
];

test("dimension", (t) => {
  t.plan(1);
  const cube = cubefilter.cube(test_cube);
  const group = cube.dimension().group();
  cube.dimension();
  t.deepEqual(group.all(), [{"key": "a1", "value": 3}], "return true")
});

test("filter", (t) => {
  t.plan(1);
  const cube = cubefilter.cube(test_cube);
  const groupA = cube.dimension().group();
  const dimensionB = cube.dimension();
  dimensionB.filterExact("b1");
  t.deepEqual(groupA.all(), [{"key": "a1", "value": 1}], "return true")
});

test("cube", (t) => {
  t.plan(1);
  const cube = cubefilter.cube();
  const dim_a = cube.dimension(v => v.a);
  const dim_b = cube.dimension(v => v.b);
  test_facts.forEach(fact => cube.add(fact));
  dim_b.filterExact("b1");
  t.deepEqual(dim_a.group().all(), [{"key": "a1", "value": 1}], "return true")
});

test("all", (t) => {
  t.plan(1);
  const cube = cubefilter.cube();
  const all = cube.groupAll();
  test_facts.forEach(fact => cube.add(fact));
  t.deepEqual(all.value(), 2, "return true")
});

test("all-filter", (t) => {
  t.plan(1);
  const cube = cubefilter.cube();
  const all = cube.groupAll();
  cube.dimension(v => v.a).filterExact("a1");
  test_facts.forEach(fact => cube.add(fact));
  t.deepEqual(all.value(), 1, "return true")
});

test("size", (t) => {
  t.plan(1);
  const cube = cubefilter.cube();
  cube.groupAll();
  cube.dimension(v => v.a);
  cube.dimension(v => v.b).group().reduceSum(() => 4);

  test_facts.forEach(fact => cube.add(fact));

  t.deepEqual(cube.size(), 2, "return true")
});

test("group", (t) => {
  t.plan(2);
  const cube = cubefilter.cube();
  const dim_a = cube.dimension(v => v.a);
  const dim_b = cube.dimension(v => v.b);
  const group = dim_a.group().reduceSum(() => 4);
  t.equal(group._isCount, false);

  test_facts.forEach(fact => cube.add(fact));

  dim_b.filterExact("b1");
  t.deepEqual(group.all(), [{"key": "a1", "value": 4}], "return true")
});

test("export", (t) => {
  t.plan(1);
  const cube = cubefilter.cube();
  cube.dimension(v => v.a);
  test_facts.forEach(fact => cube.add(fact));
  t.deepEqual(cube.cube, { "a1": { "_": 1}, "a2": { "_": 1}}, "return true")
});
