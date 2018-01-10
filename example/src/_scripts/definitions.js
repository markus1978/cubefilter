const cubefilter = require('cubefilter');
const d3 = require('d3');

const scope = (typeof window === 'undefined') ? {} : window; // export dimensions and groups to the global window scope in browsers
const ndx = module.exports.ndx = scope.cube =cubefilter.cube();
scope.all = ndx.groupAll();

// Maintain running tallies by year as filters are applied or removed
scope.yearlyDimension = ndx.dimension(d => d3.time.year(d.dd).getFullYear());
scope.yearlyPerformanceGroup = scope.yearlyDimension.group().reduce(
  // callback for when facts are added during cube construction
  (p, v) => {
    ++p.count;
    p.absGain += v.close - v.open;
    p.fluctuation += Math.abs(v.close - v.open);
    p.sumIndex += (v.open + v.close) / 2;
    p.avgIndex = p.sumIndex / p.count;
    p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
    p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
    return p;
  },
  // callback for when facts are removed during cube construction (usually omittable)
  (p, v) => {
    --p.count;
    p.absGain -= v.close - v.open;
    p.fluctuation -= Math.abs(v.close - v.open);
    p.sumIndex -= (v.open + v.close) / 2;
    p.avgIndex = p.count ? p.sumIndex / p.count : 0;
    p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
    p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
    return p;
  },
  // callback for measure initialization
  () => {
    return {
      count: 0,
      absGain: 0,
      fluctuation: 0,
      fluctuationPercentage: 0,
      sumIndex: 0,
      avgIndex: 0,
      percentageGain: 0
    };
  },
  // callback for measure aggregation over multiple cells, during cube construction and usage
  function (p1, p2) {
    const p = {
      count: p1.count + p2.count,
      absGain: p1.absGain + p2.absGain,
      fluctuation: p1.fluctuation + p2.fluctuation,
      sumIndex: p1.sumIndex + p2.sumIndex,
      avgIndex: (p1.sumIndex + p2.sumIndex) / (p1.count + p2.count)
    };
    p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
    p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
    return p;
  }
);

// Create categorical dimension
scope.gainOrLoss = ndx.dimension(d => d.open > d.close ? 'Loss' : 'Gain');
// Produce counts records in the dimension. The standard reduce functions realize a simple count of facts.
scope.gainOrLossGroup = scope.gainOrLoss.group();

// Determine a histogram of percent changes
scope.fluctuation = ndx.dimension(d => Math.round((d.close - d.open) / d.open * 100));
scope.fluctuationGroup = scope.fluctuation.group();

// Summarize volume by quarter
scope.quarter = ndx.dimension((d) => {
  const month = d.dd.getMonth();
  if (month <= 2) {
    return 'Q1';
  } else if (month > 2 && month <= 5) {
    return 'Q2';
  } else if (month > 5 && month <= 8) {
    return 'Q3';
  } else {
    return 'Q4';
  }
});
// Use the sum reduction to aggregate facts by volume total.
scope.quarterGroup = scope.quarter.group().reduceSum((d) => d.volume);

// Counts per weekday
scope.dayOfWeek = ndx.dimension(d => {
  const day = d.dd.getDay();
  const name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return day + '.' + name[day];
});
scope.dayOfWeekGroup = scope.dayOfWeek.group();


