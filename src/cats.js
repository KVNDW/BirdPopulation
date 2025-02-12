// Load data
d3.csv("./data/clean/total_cats.csv").then(data => {
    data.forEach(d => {
        d.year = +d.year;
        d.total_cats = +d.total_cats;
    });

    data.forEach(d => {
        console.log(d.year, d.total_cats);
    });

    // Draw chart
    drawLineCats(data);
}).catch(error => console.log("Error loading the data:", error));

function drawLineCats(data) {

    const svg = d3.select("#cato").append("svg")
        .attr("width", SVG_WIDTH + MARGIN.left + MARGIN.right)
        .attr("height", SVG_HEIGHT + MARGIN.top + MARGIN.bottom)
        .append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);


    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, WIDTH]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.total_cats) - 1, d3.max(data, d => d.total_cats) + 1])
        .range([HEIGHT, 0]);


    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.total_cats));


    svg.append("g")
        .attr("transform", `translate(0,${HEIGHT})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));


    svg.append("g")
        .call(d3.axisLeft(yScale));


    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2);


    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.total_cats))
        .attr("fill", "steelblue")
        .on("mouseover", function (event, d) {
            d3.select(".tooltip")
                .style("display", "block")
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
                .html(`Year: ${d.year}<br/>Cats: ${d.total_cats}`);
        })
        .on("mouseout", function () {
            d3.select(".tooltip")
                .style("display", "none");
        });

    svg.append("text")
        .attr("x", WIDTH / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Cats in switerland");

    svg.append("text")
        .attr("x", WIDTH / 2)
        .attr("y", HEIGHT + MARGIN.bottom - 10)
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -HEIGHT / 2)
        .attr("y", -MARGIN.left + 15)
        .style("text-anchor", "middle")
        .text("Amount of cats");
}