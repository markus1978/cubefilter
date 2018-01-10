'use strict';

d3.json('cube.json', function (cube) {
  const numberFormat = d3.format('.2f');

  // Load the cube
  ndx.cube = cube;

  // Bubble Chart
  const yearlyBubbleChart = dc.bubbleChart('#yearly-bubble-chart');
  yearlyBubbleChart
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
    // Elastic Scaling
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
    // Customize Axes
    // Set a custom tick format. Both `.yAxis()` and `.xAxis()` return an axis object,
    // so any additional method chaining applies to the axis, not the chart.
    .yAxis().tickFormat(function (v) {
    return v + '%';
  });

  // Pie/Donut Charts
  const gainOrLossChart = dc.pieChart('#gain-loss-chart');
  gainOrLossChart
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
      let label = d.key;
      if (all.value()) {
        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
      }
      return label;
    });

  const quarterChart = dc.pieChart('#quarter-chart');
  quarterChart
    .width(180)
    .height(180)
    .radius(80)
    .innerRadius(30)
    .dimension(quarter)
    .group(quarterGroup);

  // Row Chart
  const dayOfWeekChart = dc.rowChart('#day-of-week-chart');
  dayOfWeekChart
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

  // Bar Chart
  const fluctuationChart = dc.barChart('#fluctuation-chart');
  fluctuationChart
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
      const filter = filters[0];
      let s = '';
      s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
      return s;
    });

  // Customize axes
  fluctuationChart.xAxis().tickFormat(
    function (v) { return v + '%'; });
  fluctuationChart.yAxis().ticks(5);

  // Data Count
  const nasdaqCount = dc.dataCount('.dc-data-count');
  nasdaqCount
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

  // Rendering
  dc.renderAll();
});
