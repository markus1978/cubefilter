'use strict';

// ### Create Chart Objects
var gainOrLossChart = dc.pieChart('#gain-loss-chart');
var fluctuationChart = dc.barChart('#fluctuation-chart');
var quarterChart = dc.pieChart('#quarter-chart');
var dayOfWeekChart = dc.rowChart('#day-of-week-chart');
// var moveChart = dc.lineChart('#monthly-move-chart');
// var volumeChart = dc.barChart('#monthly-volume-chart');
var yearlyBubbleChart = dc.bubbleChart('#yearly-bubble-chart');
var nasdaqCount = dc.dataCount('.dc-data-count');

//### Load your data
d3.csv('ndx.csv', function (data) {
  // SERVER SIDE

  // Since its a csv file we need to format the data a bit.
  var dateFormat = d3.time.format('%m/%d/%Y');
  var numberFormat = d3.format('.2f');

  data.forEach(function (d) {
    d.dd = dateFormat.parse(d.date);
    d.month = d3.time.month(d.dd); // pre-calculate month for better performance
    d.close = +d.close; // coerce to number
    d.open = +d.open;
    d.volume = +d.volume;
  });

  //### Create Cubefilter Dimensions and Groups

  var ndx = cubefilter();
  var all = ndx.groupAll();

  // Dimension by year
  var yearlyDimension = ndx.dimension(function (d) {
    return d3.time.year(d.dd).getFullYear();
  });
  // Maintain running tallies by year as filters are applied or removed
  var yearlyPerformanceGroup = yearlyDimension.group().reduce(
    /* callback for when data is added to the current filter results */
    function (p, v) {
      ++p.count;
      p.absGain += v.close - v.open;
      p.fluctuation += Math.abs(v.close - v.open);
      p.sumIndex += (v.open + v.close) / 2;
      p.avgIndex = p.sumIndex / p.count;
      p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
      p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
      return p;
    },
    /* callback for when data is removed from the current filter results */
    function (p, v) {
      --p.count;
      p.absGain -= v.close - v.open;
      p.fluctuation -= Math.abs(v.close - v.open);
      p.sumIndex -= (v.open + v.close) / 2;
      p.avgIndex = p.count ? p.sumIndex / p.count : 0;
      p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
      p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
      return p;
    },
    /* initialize p */
    function () {
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
    /* aggregate ps */
    function (p1, p2) {
      var p = {
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
  var gainOrLoss = ndx.dimension(function (d) {
    return d.open > d.close ? 'Loss' : 'Gain';
  });
  // Produce counts records in the dimension
  var gainOrLossGroup = gainOrLoss.group();

  // Determine a histogram of percent changes
  var fluctuation = ndx.dimension(function (d) {
    return Math.round((d.close - d.open) / d.open * 100);
  });
  var fluctuationGroup = fluctuation.group();

  // Summarize volume by quarter
  var quarter = ndx.dimension(function (d) {
    var month = d.dd.getMonth();
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
  var quarterGroup = quarter.group().reduceSum(function (d) {
    return d.volume;
  });

  // Counts per weekday
  var dayOfWeek = ndx.dimension(function (d) {
    var day = d.dd.getDay();
    var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return day + '.' + name[day];
  });
  var dayOfWeekGroup = dayOfWeek.group();

  data.forEach(d => {
    ndx.add(d);
  });

  // CLIENT SIDE

  //#### Bubble Chart
  yearlyBubbleChart /* dc.bubbleChart('#yearly-bubble-chart', 'chartGroup') */
  // (_optional_) define chart width, `default = 200`
    .width(990)
    // (_optional_) define chart height, `default = 200`
    .height(250)
    // (_optional_) define chart transition duration, `default = 750`
    .transitionDuration(1500)
    .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(yearlyDimension)
    //The bubble chart expects the groups are reduced to multiple values which are used
    //to generate x, y, and radius for each key (bubble) in the group
    .group(yearlyPerformanceGroup)
    // (_optional_) define color function or array for bubbles: [ColorBrewer](http://colorbrewer2.org/)
    .colors(colorbrewer.RdYlGn[9])
    //(optional) define color domain to match your data domain if you want to bind data or color
    .colorDomain([-500, 500])
    //##### Accessors

    //Accessor functions are applied to each value returned by the grouping

    // `.colorAccessor` - the returned value will be passed to the `.colors()` scale to determine a fill color
    .colorAccessor(function (d) {
      return d.value.absGain;
    })
    // `.keyAccessor` - the `X` value will be passed to the `.x()` scale to determine pixel location
    .keyAccessor(function (p) {
      return p.value.absGain;
    })
    // `.valueAccessor` - the `Y` value will be passed to the `.y()` scale to determine pixel location
    .valueAccessor(function (p) {
      return p.value.percentageGain;
    })
    // `.radiusValueAccessor` - the value will be passed to the `.r()` scale to determine radius size;
    //   by default this maps linearly to [0,100]
    .radiusValueAccessor(function (p) {
      return p.value.fluctuationPercentage;
    })
    .maxBubbleRelativeSize(0.3)
    .x(d3.scale.linear().domain([-2500, 2500]))
    .y(d3.scale.linear().domain([-100, 100]))
    .r(d3.scale.linear().domain([0, 4000]))
    //##### Elastic Scaling

    //`.elasticY` and `.elasticX` determine whether the chart should rescale each axis to fit the data.
    .elasticY(true)
    .elasticX(true)
    //`.yAxisPadding` and `.xAxisPadding` add padding to data above and below their max values in the same unit
    //domains as the Accessors.
    .yAxisPadding(100)
    .xAxisPadding(500)
    // (_optional_) render horizontal grid lines, `default=false`
    .renderHorizontalGridLines(true)
    // (_optional_) render vertical grid lines, `default=false`
    .renderVerticalGridLines(true)
    // (_optional_) render an axis label below the x axis
    .xAxisLabel('Index Gain')
    // (_optional_) render a vertical axis lable left of the y axis
    .yAxisLabel('Index Gain %')
    //##### Labels and  Titles

    //Labels are displayed on the chart for each bubble. Titles displayed on mouseover.
    // (_optional_) whether chart should render labels, `default = true`
    .renderLabel(true)
    .label(function (p) {
      return p.key;
    })
    // (_optional_) whether chart should render titles, `default = false`
    .renderTitle(true)
    .title(function (p) {
      return [
        p.key,
        'Index Gain: ' + numberFormat(p.value.absGain),
        'Index Gain in Percentage: ' + numberFormat(p.value.percentageGain) + '%',
        'Fluctuation / Index Ratio: ' + numberFormat(p.value.fluctuationPercentage) + '%'
      ].join('\n');
    })
    //#### Customize Axes

    // Set a custom tick format. Both `.yAxis()` and `.xAxis()` return an axis object,
    // so any additional method chaining applies to the axis, not the chart.
    .yAxis().tickFormat(function (v) {
    return v + '%';
  });

  // #### Pie/Donut Charts
  gainOrLossChart /* dc.pieChart('#gain-loss-chart', 'chartGroup') */
  // (_optional_) define chart width, `default = 200`
    .width(180)
    // (optional) define chart height, `default = 200`
    .height(180)
    // Define pie radius
    .radius(80)
    // Set dimension
    .dimension(gainOrLoss)
    // Set group
    .group(gainOrLossGroup)
    // (_optional_) by default pie chart will use `group.key` as its label but you can overwrite it with a closure.
    .label(function (d) {
      if (gainOrLossChart.hasFilter() && !gainOrLossChart.hasFilter(d.key)) {
        return d.key + '(0%)';
      }
      var label = d.key;
      if (all.value()) {
        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
      }
      return label;
    });

  quarterChart /* dc.pieChart('#quarter-chart', 'chartGroup') */
    .width(180)
    .height(180)
    .radius(80)
    .innerRadius(30)
    .dimension(quarter)
    .group(quarterGroup);

  //#### Row Chart
  dayOfWeekChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
    .width(180)
    .height(180)
    .margins({top: 20, left: 10, right: 10, bottom: 20})
    .group(dayOfWeekGroup)
    .dimension(dayOfWeek)
    // Assign colors to each value in the x scale domain
    .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
    .label(function (d) {
      return d.key.split('.')[1];
    })
    // Title sets the row text
    .title(function (d) {
      return d.value;
    })
    .elasticX(true)
    .xAxis().ticks(4);

  //#### Bar Chart
  fluctuationChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
    .width(420)
    .height(180)
    .margins({top: 10, right: 50, bottom: 30, left: 40})
    .dimension(fluctuation)
    .group(fluctuationGroup)
    .elasticY(true)
    // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
    .centerBar(true)
    // (_optional_) set gap between bars manually in px, `default=2`
    .gap(1)
    // (_optional_) set filter brush rounding
    .round(dc.round.floor)
    .alwaysUseRounding(true)
    .x(d3.scale.linear().domain([-25, 25]))
    .renderHorizontalGridLines(true)
    // Customize the filter displayed in the control span
    .filterPrinter(function (filters) {
      var filter = filters[0], s = '';
      s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
      return s;
    });

  // Customize axes
  fluctuationChart.xAxis().tickFormat(
    function (v) { return v + '%'; });
  fluctuationChart.yAxis().ticks(5);

  //#### Data Count
  nasdaqCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
    .dimension(ndx)
    .group(all)
    // (_optional_) `.html` sets different html when some records or all records are selected.
    // `.html` replaces everything in the anchor with the html given using the following function.
    // `%filter-count` and `%total-count` are replaced with the values obtained.
    .html({
      some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
      ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
      all: 'All records selected. Please click on the graph to apply filters.'
    });

  //#### Rendering
  dc.renderAll();
});
