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
  .domain([0, 1])
  .range(["gainsboro", "#eb307c"]);

var legendText = ["เคยไป", "ไม่เคยไป"];

// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
var legend = d3.select("#result").append("svg")
    .attr("class", "legend")
    .attr("width", 140)
    .attr("height", 100)
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

//Create SVG element and append map to the SVG
var svg = d3.select("#result")
  .append("svg")
  .attr("class", "map")
  .attr("width", width)
  .attr("height", height);

// Append Div for tooltip to SVG
var tooltip = d3.select("body")
  .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var geo;
var updateGeo = function(province, visited) {
  for (var i = 0; i < geo.features.length; i++)  {
    if (province === geo.features[i].properties.CHA_NE) {
      geo.features[i].properties.visited = visited;
      break;
    }
  }
}
var updateMap = function() {
  svg.selectAll("path")
    .style("fill", function(d) {
      var value = d.properties.visited;
      return value ? color(value) : "gainsboro";
    });
}

var provinces;
var findProvinceTH = function(province) {
  // Find the corresponding province inside the GeoJSON
  for (var i = 0; i < provinces.length; i++)  {
    if (province === provinces[i].province) {
      return provinces[i].provinceTH;
    }
  }
}

d3.csv("data/provinces-visited.csv", function(data) {
  provinces = data;

  // dropdown
  var $provinces = $("#provinces");
  provinces.forEach(function(row) {
    $provinces.append($("<option>", {
      value: row.province,
      text: row.provinceTH
    }));
  });
  $('.ui.dropdown')
    .dropdown({
      onAdd: function(value, text, $selectedItem) {
        updateGeo(value, 1);
        updateMap();
      },
      onRemove: function(value, text, $selectedItem) {
        updateGeo(value, 0);
        updateMap();
      }
    });

  // Load GeoJSON data and merge with states data
  d3.json("data/thailand.json", function(json) {
    geo = json;

    // Loop through each province in the .csv file
    provinces.forEach(function(d) {
      updateGeo(d.province, d.visited);
    })

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(geo.features)
      .enter()
      	.append("path")
      	.attr("d", path)
      	.style("stroke", "#fff")
      	.style("stroke-width", "1")
        .on("mouseover", function(d) {
            tooltip.transition()
              .duration(200)
              .style("opacity", 0.8);
            tooltip.html(findProvinceTH(d.properties.CHA_NE))
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 30) + "px");
          })
        .on("mouseout", function(d) {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          });
    updateMap();
  });
});
