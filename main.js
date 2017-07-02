//Width and height of map
var width = 400;
var height = 700;

// D3 Projection
var projection = d3.geoAlbers()
  .center([100.0, 13.5])
  .rotate([0, 24])
  .parallels([5, 21])
  .scale(1200 * 2)
  .translate([-100, 200]);

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

// Define linear scale for output
var color = d3.scaleLinear()
  .range(["gainsboro","mediumaquamarine","darkcyan"]);

var legendText = ["เคยอยู่", "เคยเที่ยว", "ไม่เคยอยู่/เที่ยว"];

//Create SVG element and append map to the SVG
var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// // Append Div for tooltip to SVG
// var div = d3.select("body")
//   .append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0);

// Load in my states data!
d3.csv("data/provinces-visited.csv", function(data) {
  color.domain([0, 1, 2]); // setting the range of the input data

  // Load GeoJSON data and merge with states data
  d3.json("data/thailand.json", function(json) {
    // Loop through each state data value in the .csv file
    for (var i = 0; i < data.length; i++) {
    	// Grab State Name
    	var dataState = data[i].state;

    	// Grab data value
    	var dataValue = data[i].visited;

    	// Find the corresponding state inside the GeoJSON
    	for (var j = 0; j < json.features.length; j++)  {
    		var jsonState = json.features[j].properties.CHA_NE;

    		if (dataState == jsonState) {
      		// Copy the data value into the JSON
      		json.features[j].properties.visited = dataValue;

      		// Stop looking through the JSON
      		break;
    		}
    	}
    }

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
    	.data(json.features)
    	.enter()
    	.append("path")
    	.attr("d", path)
    	.style("stroke", "#fff")
    	.style("stroke-width", "1")
    	.style("fill", function(d) {
        	// Get data value
        	var value = d.properties.visited;

        	if (value) {
          	return color(value);
        	} else {
          	return "gainsboro";
        	}
        });

    // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
    var legend = d3.select("body").append("svg")
        .attr("class", "legend")
        .attr("width", 140)
        .attr("height", 200)
        .selectAll("g")
      .data(color.domain().slice().reverse())
        .enter()
        .append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
          	legend.append("rect")
          	  .attr("width", 18)
          	  .attr("height", 18)
          	  .style("fill", color);
          	legend.append("text")
        		  .data(legendText)
            	  .attr("x", 24)
            	  .attr("y", 9)
            	  .attr("dy", ".35em")
            	  .text(function(d) { return d; });
  });
});

// $('.ui.dropdown')
//   .dropdown({
//     onChange: function(value, text, $selectedItem) {
//       console.log(value + " " + text);
//     }
//   });
