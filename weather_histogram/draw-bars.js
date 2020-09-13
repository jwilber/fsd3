async function drawBars() {
  const dataset = await d3.json('../my_weather_data.json')


  // original
  const width = 600
  let dimensions = {
    width: width,
    height: width * 0.8,
    margin: {
      top: 35,
      right: 10,
      bottom: 50,
      left: 50
    },
  };
  dimensions.boundedWidth = dimensions.width - dimensions.margin.right - dimensions.margin.left;
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const drawHistogram = metric => {

    const metricAccessor = d => d[metric];
    const yAccessor = d => d.length;

    const svg = d3.select('#wrapper')
      .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)

    svg.attr("role", "figure")
      .attr("tabindex", "0")
      .append("title")
      .text("Histogram looking at the distribution of humidity in 2016")


    const bounds = svg.append('g')
      .style('transform', `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);


    const xScale = d3.scaleLinear().domain(d3.extent(dataset, metricAccessor)).range([0, dimensions.boundedWidth]).nice()


    const binGenerator = d3.histogram()
      .domain(xScale.domain())
      .value(metricAccessor)
      .thresholds(12);
    const bins = binGenerator(dataset);
    console.log('bins', bins)

    const yScale = d3.scaleLinear().domain([0, d3.max(bins, yAccessor)]).range([dimensions.boundedHeight, 0]).nice()
    // draw
    const binGroup = bounds.append('g').attr("tabindex", "0")
      .attr("role", "list").attr("aria-label", "histogram bars")
    const binGroups = binGroup.selectAll('g')
      .data(bins)
      .enter().append('g')
      .attr("tabindex", "0")
      .attr("role", "listitem").attr("aria-label", d => `There were ${
        yAccessor(d)
        } days between ${d.x0.toString().slice(0, 4)
        } and ${d.x1.toString().slice(0, 4)
        } humidity levels.`);

    const barPadding = 2;

    const barRects = binGroups.append("rect").attr("x", d => xScale(d.x0) + barPadding / 2).attr("y", d => yScale(yAccessor(d))).attr("width", d => d3.max([
      0,
      xScale(d.x1) - xScale(d.x0) - barPadding
    ]))
      .attr("height", d => dimensions.boundedHeight
        - yScale(yAccessor(d))
      )
      .attr("fill", "cornflowerblue")

    // filter data to nonzero bins
    const barText = binGroups.filter(yAccessor)
      .append('text')
      .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr('y', d => yScale(yAccessor(d)))
      .text(yAccessor)
      .style("text-anchor", "middle")
      .attr("fill", "darkgrey")
      .style("font-size", "12px")
      .style("font-family", "sans-serif")


    // mean
    const mean = d3.mean(dataset, metricAccessor)
    console.log('mean', mean)

    const meanLine = bounds.append('line')
      .attr('x1', xScale(mean))
      .attr('x2', xScale(mean))
      .attr('y1', -15)
      .attr('y2', dimensions.boundedHeight)
      .attr("stroke", "maroon")
      .attr("stroke-dasharray", "2px 4px")
      .attr('stroke-width', 4)

    const meanText = bounds.append('text')
      .attr('x', xScale(mean))
      .attr('y', -20)
      .text('Mean')
      .attr('fill', 'maroon')
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')

    // axes
    const xAxisGenerator = d3.axisBottom()
      .scale(xScale);

    const xAxis = bounds.append('g')
      .call(xAxisGenerator)
      .style('transform', `translateY(${dimensions.boundedHeight}px)`)

    const xAxisLabel = xAxis.append('text')
      .attr("x", dimensions.boundedWidth / 2)
      .attr("y", dimensions.margin.bottom - 5)
      .attr("fill", "black")
      .style("font-size", "1.4em")
      .text(metric)
      .style("text-anchor", "middle")
      .style('text-transform', 'capitalize')

    svg.selectAll("text")
      .attr("role", "presentation")
      .attr("aria-hidden", "true")
  }

  const metrics = ["windSpeed", "moonPhase",
    "dewPoint",
    "humidity",
    "uvIndex",
    "windBearing",
    "temperatureMin",
    "temperatureMax",
  ]
  metrics.forEach(drawHistogram)

}

drawBars()