// if the data you are going to import is small, then you can import it using es6 import
// import MY_DATA from './app/data/example.json'
// (I tend to think it's best to use screaming snake case for imported json)
const domReady = require('domready');
const d3 = Object.assign({}, require("d3-selection"), require("d3-scale"), require("d3-shape"), 
  require("d3-array"), require("d3-axis"), require("d3-fetch"), require("d3-time-format"), require("d3-transition"));


domReady(() => {

  Promise.all([
    d3.csv('../data/bench.csv'),
    d3.csv('../data/returns.csv'),
    d3.csv('../data/returns2.csv')
  ])
  .then(data => {
      const quantityData = data[0].filter(d => d.gdp !== 'NA' && d.yrs !== 'NA');
      const qualityData = data[0].filter(d => d.gdp !== 'NA' && d.score !== 'NA');
      const returnsData = data[1];
      const returnsCrossData = data[2];
      return [ quantityData, qualityData, returnsData, returnsCrossData ];
    })
  .then(data => myVis(data));
});

function createBenchmark(data, xVar, yVar, addedParams){
  d3.select('.checkbox')
    .style('opacity', '.4');
  document.getElementById('regional').disabled = true;

  const margin = {top: 50, right: 50, bottom: 50, left: 50},
  width = 600 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;
  // const padding = 50;

  // Define max
  const xMax = d3.max(data, (d) => {
    return d[xVar]
  });

  const yMax = d3.max(data, (d) => {
    return d[yVar]
  });

  // Define X Scale
  const xScale = d3.scaleLinear()
    //.base(Math.E)
    .domain([4, xMax])
    .range([0, width])
    .nice();

  // TERNARY SAME AS IF-ELSE STATEMENT
  const yMin = (yVar === 'score') ? 250 : 0;

  // Define Y Scale
  const yScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0])
    .nice();

  // Map scales to axes
  const xAxis = d3.axisBottom(xScale)
      .ticks(5);

  const yAxis = d3.axisLeft(yScale);


  // Define event handler mouseover
  function mouseOverIn (d) {
    d3.select(this)
      // .attr('r', 10)
      .style('fill', 'steelblue');

    // Specify where to put country label
    svg.append('text')
    .attr('class', 'label')
    .attr('x', xScale(d[xVar]) - 10)
    .attr('y', yScale(d[yVar]) - 15)
    .text(function () {
      return d.country;
    });
  }

  function mouseOverOut(d) {
    d3.select(this)
      // .attr('r', 5)
      .style('fill', '#bfb5b2');
    d3.select('.label')
      .remove();
  }

  // Define svg
  const svg = d3.select(".benchmark-container")
    .append("svg")
    .attr("class", yVar)
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  // Map data to circles + use scales to map to variables
  const circles = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr('cx', 0)
    .attr("cy", d => {
      return yScale(d[yVar]);
    })
    .attr('r', 1)
    .attr('class', 'dot')

  // Group together elements of axes
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

  svg.append("g")
    // .attr("transform", "translate(" + margin.left + "," + (margin.top-60)  + ")")
    .call(yAxis);


  // x Axis Title - Same for both
  svg.append('text')
    .attr('class', 'text')
    .attr('y', height + 35)
    .attr('x', width/2)
    .style('text-anchor', 'middle')
    .text('GDP per capita, (constant 2010 US$), 2017');

  // y Axis Title - Differs
  svg.append('text')
    .attr('class', 'text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 15)
    .attr('x', -height/2)
    .style('text-anchor', 'middle')
    .text(function(title) {
      if (yVar==='yrs') {
      return 'Years of Schooling, 2010'} 
      else {
        return 'Harmonized Test Scores, 2017'};})

  // Source
  svg.append('text')
    .attr('class', 'text source')
    .attr('y', height + 50)
    .attr('x', 0)
    .style('text-anchor', 'right')
    .text('Source: World Development Indicators, World Bank Education Statistics')

  // Title - Differs
  svg.append('text')
    .attr('class', 'text title')
    .attr('y', 0)
    .attr('x', width/2)
    .style('text-anchor', 'middle')
    .text(function(title) {
      if (yVar==='yrs') {
        return 'Benchmarking the Quantity of Schooling'} 
      else {
        return 'Benchmarking the Quality of Schooling'};
    });

  // Note if country does not have data
  // should only display if above is true
  svg.append('text')
    .attr('class', yVar + '-note')
    .attr('y', margin.top/2)
    .attr('x', width/2)
    .style('text-anchor', 'middle')
    .text('*Data not available for selected country')

  svg.selectAll('.dot')
    .data(data)
    .transition()
    .duration(1500)
    .attr("cx", d => {
      return xScale(d[xVar]);
    })
    .attr("cy", d => {
      return yScale(d[yVar]);
    })
    .attr("r", 5)
    .attr('class', 'dot')


  svg.selectAll('circle')
    .on('click', (data) => {
      triggerAllCharts(addedParams, data.country);
    })

    .on('mouseover', mouseOverIn)
    .on('mouseout', mouseOverOut);

}

function createBar(data) {
  console.log(data);

  const width = 700;
  const height = 500;
  const padding = 50;

  d3.selectAll('svg.bar').remove();

  const selectedCountry = data;

  const years = selectedCountry.map(d => d.year);

  const yMaxBar = d3.max(selectedCountry, (d) => {
    return d.overall;
  });

  const xExtentBar = d3.extent(selectedCountry, (d) => {
    return d.year;
  });

  // Define Y Scale
  const yScaleBar = d3.scaleLinear()
    .domain([0, yMaxBar])
    .range([height - padding, padding])
    .nice();

  const xMaxBar = d3.max(selectedCountry, (d) => {
    return d.year;
  });

 const xMinBar = d3.min(selectedCountry, (d) => {
    return d.year;
  });

 // REFERENCED THE FOLLOWING URL FOR GETTING X-AXIS SCALE
 // https://plnkr.co/edit/HQz1BL9SECFIsQ5bG8qb?p=preview
 const xScaleBar = d3.scaleBand()
  .rangeRound([0, width - (padding * 2)])
  .domain(years)
  .paddingInner(0.05);

  // Map scales to axes
  const yAxisBar = d3.axisLeft(yScaleBar);
  const xAxisBar = d3.axisBottom(xScaleBar).tickFormat(d3.timeFormat("%Y"));

  // Define svg
  const svgbar = d3.select('.barchart-container')
    .append('svg')
    .attr('class', 'bar')
    .attr("height", height)
    .attr("width", width);

  // Map data to bars + use scales to map to variables
  const bars = svgbar.selectAll("rect")
    .data(selectedCountry)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr("x", (d) => {
      return xScaleBar(d.year) + padding;
      })
    .attr("y", (d) => {
      return yScaleBar(0);
      })
    .attr("width", xScaleBar.bandwidth())
    .attr("height", (d) => {
      return yScaleBar(0) - yScaleBar(0);
    });

  svgbar.selectAll('rect')
    .transition()
    .duration(2500)
    .attr("y", (d) => {
      return yScaleBar(d.overall);
    })
    .attr("height", (d) => {
      return yScaleBar(0) - yScaleBar(d.overall);
    })


  // g groups together all elements of axis - ticks, values, etc.
  svgbar.append("g")
    .attr("transform", "translate(" + padding + "," + (height - padding) + ")")
    .call(xAxisBar)
    .selectAll("text")
    .attr("y", 9)
    .attr("x", 0)
    .attr("dy", ".35em")
    .attr("transform", "rotate(45)")
    .style("text-anchor", "start");

  svgbar.append("g")
    .attr("transform", "translate(" + (padding) + ", 0)")
    .call(yAxisBar);

  // x Axis Title
  svgbar.append('text')
    .attr('class', 'text')
    .attr('y', height - (padding/4))
    .attr('x', (width/2))
    .style('text-anchor', 'middle')
    .text('Year');

  // y Axis Title
  svgbar.append('text')
    .attr('class', 'text')
    .attr('transform', 'rotate(-90)')
    .attr('y', padding - 40)
    .attr('x', -(height/2))
    .style('text-anchor', 'middle')
    .text('Returns to Schooling');

  // Source
  svgbar.append('text')
    .attr('class', 'text source')
    .attr('y', height)
    .attr('x', width/2)
    .style('text-anchor', 'right')
    .text('Source: Psacharopoulos & Patrinos, 2018');

  // Title
  svgbar.append('text')
    .attr('class', 'text title')
    .attr('y', padding)
    .attr('x', (width/2))
    .style('text-anchor', 'middle')
    .text('Returns to Schooling over time: ' + selectedCountry[0].country);
  
}

// Inspiration: https://www.d3-graph-gallery.com/graph/lollipop_horizontal.html
// https://bl.ocks.org/tlfrd/e1ddc3d0289215224a69405f5e538f51
function createLollipopChart(data) {
  // set the dimensions and margins of the graph
  const margin = {top: 60, right: 30, bottom: 40, left: 90},
      width = 600 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  d3.selectAll('svg.lollipop').remove();

  // append the svg object to the body of the page
  const svg = d3.select(".lollipop-container")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr('class', 'lollipop')
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // X Max
  const xMaxLollipop = d3.max(data, (d) => {
    return d.value;
  });

  // X axis
  const x = d3.scaleLinear()
    // .domain([0, 20])
    .domain([0, xMaxLollipop + 5])
    .range([ 0, width]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Y axis
  const y = d3.scaleBand()
    .range([ 0, height ])
    .domain(data.map(function(d) { return d.type; }))
    .padding(1);

  svg.append("g")
    .call(d3.axisLeft(y));

  // Define event handler mouseover
  function mouseOverIn (d) {
    d3.select(this)
      // .attr('r', 10)
      .style('fill', 'steelblue');

    // Specify where to put country label
    svg.append('text')
    .attr('class', 'label')
    .attr('x', x(d.value) - 100)
    .attr('y', y(d.type) - 15)
    .text(function () {
      return "Source: " + d.source;
    });

    svg.append('text')
      .attr('class', 'sourcelabel')
      .attr('x', x(d.value) - 100)
      .attr('y', y(d.type) - 25)
      .text(function () {
        return "Year: " + new Date(d.year).getFullYear();
    });
  }

  function mouseOverOut(d) {
    d3.select(this)
      // .attr('r', 5)
      .style('fill', '"#69b3a2"');
    d3.select('.label')
      .remove();
    d3.select('.sourcelabel')
      .remove();
  }

  // TRANSITION
  svg.selectAll(".line")
    .data(data)
    .enter()
    .append('line')
      .attr('class', 'line')
      .attr('x1', x(0))
      .attr('x2', x(0))
      .attr("y1", function(d) { return y(d.type); })
      .attr("y2", function(d) { return y(d.type); })
      .attr("stroke", "grey");

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", x(0))
      .attr("cy", function(d) { return y(d.type); })
      .attr("r", "4")
      .style("fill", "#69b3a2")
      .attr("stroke", "black")
      .on('mouseover', mouseOverIn)
      .on('mouseout', mouseOverOut);

  svg.selectAll('circle')
      .transition()
      .duration(3000)
      .attr("cx", function(d) { return x(d.value); });

  svg.selectAll('.line')
      .transition()
      .duration(3000)
      .attr("x1", function(d) { return x(d.value); });

  // Title
  svg.append('text')
    .attr('class', 'text title')
    .attr('y', 0)
    .attr('x', width/2)
    .style('text-anchor', 'middle')
    .text('Disaggregated Returns to Schooling, most recent year: ' + data[0].country);

  // x Axis Title
  svg.append('text')
    .attr('class', 'text')
    .attr('y', height + 35)
    .attr('x', (width/2))
    .style('text-anchor', 'middle')
    .text('Returns to Schooling');

  // Source
  svg.append('text')
    .attr('class', 'text source')
    .attr('y', height + 50)
    .attr('x', 0)
    .style('text-anchor', 'right')
    .text('Source: Psacharopoulos & Patrinos, 2018');

}

function updateBenchmark(country) {
  d3.select('.checkbox')
    .style('opacity', '1');
  document.getElementById('regional').disabled = false;

  d3.selectAll('.selected-dot').remove();

  d3.selectAll('.dot')
    .classed('selected-dot', (data) => {
      if (data.country === country) {
        return true;
      } else {
        return false;
      }
    });

  d3.selectAll('.selected-dot')
    .attr('r', 8)
    .style('opacity', 1);

  const selected = d3.selectAll('.selected-dot').data();
  console.log(selected);

///// ADD COMPARATOR
  // let checked = false;
  // d3.select('#regional')
  //   .on('click', (data) => {
  //     let checked = d3.select(this).property('checked')
  //   });

  // d3.selectAll('.dot')
  //   .classed('comparator', (data) => {
  //     if (data.region === selected.region) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   });

    // function highlightComparators() {
    //   d3.selectAll("#regional").each(function(d) {
    //     cb = d3.select(this);
    //     grp = cb.property("value")

    //     if(cb.property('checked')) {
    //       if (data.region === selected.region) {
    //         d3.selectAll('.dot')
    //           .classed('comparator')
    //       }
    //     }
    //   })
    // }

    // d3.selectAll('.checkbox')
    //   .on('change', highlightComparators);


  // INITIALIZE AN EMPTY OBJECT WITH PROPERTIES 'YRS' AND 'SCORE', SET THEM TO FALSE, 
  // SO THAT WHEN WE LOOP OVER THE CONST 'SELECTED', WE SET THE PROPERTIES OF 'YRS' 
  // AND 'SCORE' TO TRUE OR FALSE SO THAT WE KNOW WHICH SCATTER PLOT TO DISPLAY THE 'NOTE-VISIBLE' CLASS
  let availableData = {
      yrs: false,
      score: false
  };
     
  selected.forEach(data => {
    if(data.yrs){
      availableData.yrs = true;
    }

    if(data.score){
      availableData.score = true;
    }

  });

  // If yrs does not exist, display note-visible class for yrs-note class
  if(availableData.yrs === false){
    d3.select('.yrs-note')
      .classed('note-visible', true);
  } else {
    d3.select('.yrs-note')
      .classed('note-visible', false);
  }

  // If score does not exist, display note-visible class for score-note class
  if(availableData.score === false){
    d3.select('.score-note')
      .classed('note-visible', true);
  } else {
    d3.select('.score-note')
      .classed('note-visible', false);
  }

}

function createDropdown(list){
// Reference for how to remove duplicate items from array:
// https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
  const countries = [ list[2].map(l => l.country), list[3].map(l => l.country) ].flat();

  const uniqueCountries = countries.filter(function(country, index, arr) {
    return arr.indexOf(country) === index;
  });

  d3.select('#countryDD')
    .selectAll('option')
    .data(uniqueCountries)
    .join('option')
    .attr('value', d => d);

  d3.select('#selectedInput')
    .on('change', () => {
      const selectedInput = document.getElementById('selectedInput').value;
      triggerAllCharts(list, selectedInput);
    });
}

function triggerAllCharts(list, country) {
  if(!country){
    clearCharts();
  }
  const filteredSelection = list[0].filter(data => data.country === country && data.overall)
                                .sort((a, b) => a.year - b.year);
 
  const filteredCross = list[1].filter(data => data.country === country && data.value)
                                  .sort((a, b) => a.year - b.year);

  createBar(filteredSelection);
  updateBenchmark(country);
  createLollipopChart(filteredCross);

}

function clearCharts() {
  d3.selectAll('svg.lollipop').remove();
  d3.selectAll('svg.bar').remove();
  d3.selectAll('.selected-dot').remove();
}


function myVis(d) {
  // Parse the date / time
  var parseDate = d3.timeParse("%Y");

  const quantityData = d[0].map(data => {
    return {
      gdp: +data.gdp,
      yrs: +data.yrs,
      country: data.country,
      incgrp: data.incgrp,
      region: data.Region
    };
  });

  const qualityData = d[1].map(data => {
    return {
      gdp: +data.gdp,
      score: +data.score,
      country: data.country
    };
  });

  const returnsData = d[2].map(data => {
    return {
      country: data.country,
      overall: +data.overall,

      year: parseDate(data.year)
    };
  });

  const returnsCrossData = d[3].map(data => {
    return {
      country: data.country,
      value: +data.value,
      type: data.type,
      source: data.source,
      year: parseDate(data.year)
    };
  });

  const inputArray = [returnsData, returnsCrossData, quantityData, qualityData];



  createBenchmark(quantityData, 'gdp', 'yrs', inputArray);
  createBenchmark(qualityData, 'gdp', 'score', inputArray);

  createDropdown(inputArray);
  console.log(quantityData);
}

// Legend
// First, add rectangles, then add text labels
// const legend = svg.append("g");

//   legend.append("rect")
//     .attr("class", "eastasia")
//     .attr("y", (height/2) - padding)
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - 60)
//     .attr("x", padding + (padding/3))
//     .text("East Asia");


//   legend.append("rect")
//     .attr("class", "europe")
//     .attr("y", (height/2) - (padding + 15))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 5))
//     .attr("x", padding + (padding/3))
//     .text("Europe & Central Asia");


//   legend.append("rect")
//     .attr("class", "lat")
//     .attr("y", (height/2) - (padding + 30))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 20))
//     .attr("x", padding + (padding/3))
//     .text("Latin America");

//   legend.append("rect")
//     .attr("class", "mena")
//     .attr("y", (height/2) - (padding + 45))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 35))
//     .attr("x", padding + (padding/3))
//     .text("Middle East & North Africa");

//   legend.append("rect")
//     .attr("class", "ssa")
//     .attr("y", (height/2) - (padding + 60))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 50))
//     .attr("x", padding + (padding/3))
//     .text("Sub-Saharan Africa");





//////////////////////////////
// EXAMPLE CODE STARTS HERE //
/////////////////////////////
// domReady(() => {
//   // this is just one example of how to import data. there are lots of ways to do it!
//   fetch('./data/wdi.json')
//     .then(response => response.json())
//     .then(data => myVis(data));

// });


// function myVis(data) {

//   const width = 600;
//   const height = 600;
//   const padding = 70;

// // Define X Scale
//   const xScale = d3.scaleLinear()
//     .domain([d3.max(data, (d) => d.gdp), 0])
//     .range([padding, width - padding]);

// // Define Y Scale
//   const yScale = d3.scaleLinear()
//     .domain([d3.max(data, (d) => d.litrate), 0])
//     .range([height - padding, padding*2]);

// // Map scales to axes
//   const xAxis = d3.axisTop(xScale);
//   const yAxis = d3.axisRight(yScale);

// // Define svg
//   const svg = d3.select('svg.svg-scatter')
//     .attr("height", height)
//     .attr("width", width);

// // Map data to circles + use scales to map to variables
//   const circles = svg.selectAll("circle")
//     .data(data)
//     .enter()
//     .append("circle")
//       .attr("class", d => {
//         if(d.Region === "East Asia & Pacific"){
//             return "eastasia";
//         } else if (d.Region === "Europe & Central Asia"){
//             return "europe";
//         } else if (d.Region === "Latin America & Caribbean") {
//             return "lat";
//         } else if (d.Region === "Middle East & North Africa") {
//             return "mena";
//         } 
//         else {
//             return "ssa"
//         }
//       })
//       .attr("cx", d => {
//         return xScale(d.gdp);
//       })
//       .attr("cy", d => {
//         return yScale(d.litrate);
//       })
//       .attr("r", 5)

// // g groups together all elements of axis - ticks, values, etc.
//   svg.append("g")
//     .attr("transform", "translate(0," + (padding*2) + ")")
//     .call(xAxis);

//   svg.append("g")
//     .attr("transform", "translate(" + (width - padding) + ", 0)")
//     .call(yAxis);

// // Y Axis Title
//   svg.append("text")
//     .attr("class", "text")
//     .attr("transform", "rotate(90)")
//     .attr("y", -(width - padding + (padding/2)))
//     .attr("x", ((height - padding)/2))
//     .text("Literacy Rate (%)");

// // X Axis Title
//   svg.append("text")
//     .attr("class", "text")
//     .attr("y", padding + (padding/2))
//     .attr("x", (width/2) - padding)
//     .text("GDP per capita, (constant 2010 US$)");

// // Title
//   svg.append("text")
//     .attr("class", "text title")
//     .attr("y", padding - (padding/3))
//     .attr("x", padding)
//     .text("Most countries have achieved full literacy")

// // Subtitle
//   svg.append("text")
//     .attr("class", "text subtitle")
//     .attr("y", padding)
//     .attr("x", padding)
//     .text("Adult Literacy Rate vs GDP per capita, 2015")

// // Source
//   svg.append("text")
//     .attr("class", "text source")
//     .attr("y", height - padding + (padding/2))
//     .attr("x", padding)
//     .text("Source: World Development Indicators, World Bank")

// // Legend
// // First, add rectangles, then add text labels
// const legend = svg.append("g");

//   legend.append("rect")
//     .attr("class", "eastasia")
//     .attr("y", (height/2) - padding)
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - 60)
//     .attr("x", padding + (padding/3))
//     .text("East Asia");


//   legend.append("rect")
//     .attr("class", "europe")
//     .attr("y", (height/2) - (padding + 15))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 5))
//     .attr("x", padding + (padding/3))
//     .text("Europe & Central Asia");


//   legend.append("rect")
//     .attr("class", "lat")
//     .attr("y", (height/2) - (padding + 30))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 20))
//     .attr("x", padding + (padding/3))
//     .text("Latin America");


//   legend.append("rect")
//     .attr("class", "mena")
//     .attr("y", (height/2) - (padding + 45))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 35))
//     .attr("x", padding + (padding/3))
//     .text("Middle East & North Africa");


//   legend.append("rect")
//     .attr("class", "ssa")
//     .attr("y", (height/2) - (padding + 60))
//     .attr("x", padding)
//     .attr("width", (padding/6))
//     .attr("height", (padding/6));

//   legend.append("text")
//     .attr("class", "text source")
//     .attr("y", (height/2) - (padding + 50))
//     .attr("x", padding + (padding/3))
//     .text("Sub-Saharan Africa");

// /// Bar Chart Practice

// // Define Y Scale
// const yScalebar = d3.scaleLinear()
//   .domain([0, d3.max(data, (d) => d.litrate)])
//   .range([height - padding, padding]);

// // Define X Scale
// const bandScalebar = d3.scaleBand()
//   .domain(data.map(d => d.country))
//   .range([padding, width - padding]);
    
// // Map scales to axes
// const yAxisbar = d3.axisLeft(yScalebar);
// const xAxisbar = d3.axisBottom(bandScalebar);

// // Define svg
// const svgbar = d3.select('svg.svg-bar')
//   .attr("height", height)
//   .attr("width", width);

// // Map data to bars + use scales to map to variables
// const bars = svgbar.selectAll("rect")
//   .data(data)
//   .enter()
//   .append("rect")
//   .attr("class", d => {
//     if(d.Region === "East Asia & Pacific"){
//       return "eastasia";
//     } else if (d.Region === "Europe & Central Asia"){
//       return "europe";
//     } else if (d.Region === "Latin America & Caribbean") {
//       return "lat";
//     } else if (d.Region === "Middle East & North Africa") {
//       return "mena";
//     } 
//       else {
//             return "ssa"
//     }
//       })
//   .attr("x", (d) => {
//     return bandScalebar(d.country);
//     })
//   .attr("y", (d) => {
//     return yScalebar(d.litrate);
//     })
//   .attr("width", 10)
//   .attr("height", (d) => {
//     return yScalebar(0) - yScalebar(d.litrate);
//       });

// // g groups together all elements of axis - ticks, values, etc.
//   svgbar.append("g")
//     .attr("transform", "translate(0," + (height - padding) + ")")
//     .call(xAxisbar)
//   .selectAll("text")
//     .attr("y", 9)
//     .attr("x", 0)
//     .attr("dy", ".35em")
//     .attr("transform", "rotate(45)")
//     .style("text-anchor", "start");

//   svgbar.append("g")
//     .attr("transform", "translate(" + (padding) + ", 0)")
//     .call(yAxisbar);


// }

