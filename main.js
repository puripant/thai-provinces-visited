//Width and height of map
let width = 400;
let height = 700;

// D3 Projection
let projection = d3.geoAlbers()
  .center([100.0, 13.5])
  .rotate([0, 24])
  .parallels([5, 21])
  .scale(1200 * 2)
  .translate([-100, 200]);

// Define path generator
let path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

// Define linear scale for output
let color = d3.scaleLinear()
  .domain([0, 1])
  .range(["gainsboro", "#eb307c"]);

let legendText = ["เคยไป", "ไม่เคยไป"];

// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
let legend = d3.select("#result").append("svg")
    .attr("class", "legend")
    .attr("width", 140)
    .attr("height", 100)
    .selectAll("g")
  .data(color.domain().slice().reverse())
    .enter()
    .append("g")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");
legend.append("rect")
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", color);
legend.append("text")
  .data(legendText)
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(d => d);

//Create SVG element and append map to the SVG
let svg = d3.select("#result")
  .append("svg")
  .attr("class", "map")
  .attr("width", width)
  .attr("height", height);

// Append Div for tooltip to SVG
let tooltip = d3.select("body")
  .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let geo;
let updateGeo = (province, visited) => {
  for (let i = 0; i < geo.features.length; i++)  {
    if (province === geo.features[i].properties.NAME_1) {
      if (typeof visited != "undefined") {
        geo.features[i].properties.visited = visited;
        break;
      } else {
        return geo.features[i].properties.visited;
      }
    }
  }
}
let updateMap = () => {
  svg.selectAll("path")
    .style("fill", (d) => {
      let value = d.properties.visited;
      return value ? color(value) : "gainsboro";
    });
}

let provinces;
let findProvinceTH = (province) => {
  // Find the corresponding province inside the GeoJSON
  for (let i = 0; i < provinces.length; i++)  {
    if (province === provinces[i].province) {
      return provinces[i].provinceTH;
    }
  }
}

d3.csv("data/provinces-visited.csv").then((data) => {
// d3.csv("data/place-province.csv", function(places) {
  provinces = data;

  // dropdown
  let $provinces = $("#provinces");
  provinces.forEach((row) => {
    $provinces.append($("<option>", {
      value: row.province,
      text: row.provinceTH
    }));
  });
  // places.forEach(function(row) {
  //   $provinces.append($("<option>", {
  //     value: row.province,
  //     text: row.place
  //   }));
  // });
  $('.ui.dropdown')
    .dropdown({
      onAdd: (value, text, $selectedItem) => {
        updateGeo(value, 1);
        updateMap();
      },
      onRemove: (value, text, $selectedItem) => {
        updateGeo(value, 0);
        updateMap();
      }
    });

  // Load GeoJSON data and merge with states data
  d3.json("data/thailand-new.json").then((json) => {
    geo = json;

    // Loop through each province in the .csv file
    provinces.forEach((d) => {
      updateGeo(d.province, d.visited);
    });

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(geo.features)
      .enter()
      	.append("path")
      	.attr("d", path)
      	.style("stroke", "#fff")
      	.style("stroke-width", "1")
        .on("mouseover", (event, d) => {
            tooltip.transition()
              .duration(200)
              .style("opacity", 0.8);
            tooltip.html(findProvinceTH(d.properties.NAME_1))
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 30) + "px");
          })
        .on("mouseout", (_, d) => {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          })
        .on("click", (_, d) => {
            if (updateGeo(d.properties.NAME_1) == 0) {
              $("#provinces").dropdown("set selected", d.properties.NAME_1);
              updateGeo(d.properties.NAME_1, 1);
            } else {
              $("#provinces").dropdown("remove selected", d.properties.NAME_1);
              updateGeo(d.properties.NAME_1, 0);
            }
            updateMap();
          });
    updateMap();
  });
// })
});
