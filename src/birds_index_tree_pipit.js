d3.csv('./data/clean/birds_index_tree_pipit.csv').then(function(data) {
    data.forEach(function (d) {
        // TODO consider doing this in data cleanup phase
        const indexBV = d.IndexBV.replace(/"/g, '').replace(',', '.');
        d.IndexBV = parseFloat(indexBV);
        d.Jahr = +d.Jahr;
    });
    drawChartTreePipit(data);
});

function drawChartTreePipit(data) {
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    const svg = d3.select("#tree_pipit_chart").append("svg")
        .attr("width", WIDTH + MARGIN.left + MARGIN.right)
        .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
        .append("g")
        .attr("transform",
            "translate(" + MARGIN.left + "," + MARGIN.top + ")");

    const x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return d.Jahr;
        }))
        .range([0, WIDTH]);

    let yMin = d3.min(data, function (d) {
        return d.IndexBV;
    });
    let yMax = d3.max(data, function (d) {
        return d.IndexBV;
    });
    yMin = Math.min(yMin, 100);
    yMax = Math.max(yMax, 100);

    const y = d3.scaleLinear()
        .domain([yMin - 10, yMax + 10])
        .range([HEIGHT, 0]);

    const line = d3.line()
        .x(function (d) {
            return x(d.Jahr);
        })
        .y(function (d) {
            return y(d.IndexBV);
        });

    svg.append("g")
        .attr("transform", "translate(0," + HEIGHT + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("text")
        .attr("transform",
            "translate(" + (WIDTH / 2) + " ," +
            (HEIGHT + MARGIN.top + 40) + ")")
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - MARGIN.left + 20)
        .attr("x",0 - (HEIGHT / 2))
        .attr("dy", "-2.5em")
        .style("text-anchor", "middle")
        .text("Breeding Bird Index");

    svg.append("line")
        .attr("class", "base-line")
        .attr("x1", 0)
        .attr("y1", y(100))
        .attr("x2", WIDTH)
        .attr("y2", y(100));

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 4)
        .attr("cx", function (d) {
            return x(d.Jahr);
        })
        .attr("cy", function (d) {
            return y(d.IndexBV);
        })
        // TODO change info
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Year: " + d.Jahr + "<br/>Index: " + d.IndexBV.toFixed(2))
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.append("text")
        .attr("x", (WIDTH / 2))
        .attr("y", 0 - (MARGIN.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")}

document.addEventListener("DOMContentLoaded", function () {
    const fadeIns = document.querySelectorAll('.fade-in');

    const handleIntersection = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    };

    const observer = new IntersectionObserver(handleIntersection, {
        threshold: 0.2,
    });

    fadeIns.forEach(el => observer.observe(el));
});

