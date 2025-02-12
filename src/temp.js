d3.csv('./data/clean/habitats_data.csv').then(function(habitatsData) {
    d3.csv('./data/clean/swiss_avg_temp.csv').then(function(tempData) {
        d3.csv('./data/clean/total_cats.csv').then(function (csvData) {
            const yearData = {};

            csvData.forEach(row => {
                const year = +row.Year;
                yearData[year] = {};

                Object.keys(row).forEach(key => {
                    if (key !== 'Year') {
                        yearData[year][key] = +row[key];
                    }
                });
            });

            console.log( yearData);
        });

        const alpineData = habitatsData.filter(d => d.e === "Alpine habitats");
        alpineData.forEach(function(d) {
            d.sbi = parseFloat(d.mean);
            d.year = +d.year;
        });

        tempData.forEach(d => {
            d.time = +d.time;
            d.temperature = +d.temperature;
        });

        drawCombinedChart(alpineData, tempData);
    });
});

function drawCombinedChart(alpineData, tempData) {
    const MARGIN = { top: 24, right: 30, bottom: 30, left: 50 };
    const WIDTH = 800 - MARGIN.left - MARGIN.right;
    const HEIGHT = 400 - MARGIN.top - MARGIN.bottom;

    const TEMP_HEIGHT = HEIGHT / 2;
    const ALPINE_HEIGHT = HEIGHT / 2;

    const svg = d3.select("#combined_chart")
        .append("svg")
        .attr("width", WIDTH + MARGIN.left + MARGIN.right)
        .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
        .append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);


    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("box-shadow", "0px 0px 5px rgba(0, 0, 0, 0.3)");

    const xScale = d3.scaleLinear()
        .domain(d3.extent(tempData, d => d.time))
        .range([0, WIDTH]);

    const tempYScale = d3.scaleLinear()
        .domain([0, d3.max(tempData, d => d.temperature)])
        .range([TEMP_HEIGHT, 0]);

    const alpineYScale = d3.scaleLinear()
        .domain([d3.min(alpineData, d => d.sbi) - 10, d3.max(alpineData, d => d.sbi) + 10])
        .range([TEMP_HEIGHT + ALPINE_HEIGHT, TEMP_HEIGHT]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const alpineYAxis = d3.axisLeft(alpineYScale);

    svg.append("g")
        .call(alpineYAxis);

    svg.append("g")
        .attr("transform", `translate(0,${TEMP_HEIGHT})`)
        .call(alpineYAxis);

    svg.append("g")
        .attr("transform", `translate(0,${HEIGHT})`)
        .call(xAxis);

    const alpineLine = d3.line()
        .x(d => xScale(d.year))
        .y(d => alpineYScale(d.sbi));

    const tempLine = d3.line()
        .x(d => xScale(d.time))
        .y(d => tempYScale(d.temperature));
    //alipne
    svg.append("path")
        .datum(alpineData)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", alpineLine);
     //temp
    svg.append("path")
        .datum(tempData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", tempLine);
    // line
    const years = alpineData.map(d => d.year);
    years.forEach(year => {
        const tempPoint = tempData.find(d => d.time === year);
        const alpinePoint = alpineData.find(d => d.year === year);

        if (tempPoint && alpinePoint) {
            svg.append("line")
                .attr("x1", xScale(tempPoint.time))
                .attr("y1", tempYScale(tempPoint.temperature))
                .attr("x2", xScale(alpinePoint.year))
                .attr("y2", alpineYScale(alpinePoint.sbi))
                .attr("stroke", "gray")
                .attr("stroke-dasharray", "2,2");
        }
    });

    svg.selectAll(".temp-dot")
        .data(tempData)
        .enter().append("circle")
        .attr("class", "temp-dot")
        .attr("r", 4)
        .attr("cx", d => xScale(d.time))
        .attr("cy", d => tempYScale(d.temperature))
        .attr("fill", "steelblue")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Year: ${d.time}<br/>Temperature: ${d.temperature.toFixed(2)}°C`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    svg.selectAll(".alpine-dot")
        .data(alpineData)
        .enter().append("circle")
        .attr("class", "alpine-dot")
        .attr("r", 4)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => alpineYScale(d.sbi))
        .attr("fill", "green")
        .on("mouseover", function (event, d) {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Year: ${d.year}<br>SBI Index: ${d.sbi.toFixed(2)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.append("text")
        .attr("x", WIDTH / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Temperature and Alpine SBI Comparison");

    svg.append("text")
        .attr("x", WIDTH / 2)
        .attr("y", HEIGHT + MARGIN.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(TEMP_HEIGHT + ALPINE_HEIGHT / 2))
        .attr("y", -MARGIN.left + 15)
        .attr("text-anchor", "middle")
        .text("SBI Index");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -TEMP_HEIGHT / 2)
        .attr("y", -MARGIN.left + 15)
        .attr("text-anchor", "middle")
        .text("Temperature (°C)");
}