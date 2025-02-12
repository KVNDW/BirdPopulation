d3.csv('./data/clean/habitats_data.csv').then(function(data) {
    data.forEach(function(d) {
        d.sbi = parseFloat(d.mean);
        d.year = +d.year;
    });
    drawChartHabitats(data);
});

const ICONS_PATHS = {
    "Alpine habitats": "./resources/mountain.png",
    "Settlements": "./resources/settlement.png",
    "Wetlands": "./resources/wetland.png",
    "Woodland": "./resources/woodlands.png"
};


function drawChartHabitats(data){
    const selectedGroups = [ "Alpine habitats", "Settlements", "Wetlands", "Woodland"];
    const groups = d3.group(data, d => d.e);
    let activeGroups = new Set(selectedGroups);
    const groupNames = Array.from(groups.keys()).filter(name => selectedGroups.includes(name));

    const HABITATS_WIDTH = 500;
    const HABITATS_HEIGHT = 170 + groupNames.length * 40;

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, HABITATS_WIDTH]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.sbi) - 10, 150])
        .range([HABITATS_HEIGHT, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(groupNames);

    const svg = d3.select("#habitats_chart")
        .append("svg")
        .attr("width", HABITATS_WIDTH + MARGIN.left + MARGIN.right)
        .attr("height", HABITATS_HEIGHT + MARGIN.top + MARGIN.bottom)
        .append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${HABITATS_HEIGHT})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("text")
        .attr("x", HABITATS_WIDTH / 2)
        .attr("y", HABITATS_HEIGHT + MARGIN.bottom - 10)
        .attr("text-anchor", "middle")

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -HABITATS_HEIGHT / 2)
        .attr("y", -MARGIN.left + 15)
        .attr("text-anchor", "middle")
        .text("SBI Index");

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.sbi));

    const dots = svg.append("g").attr("class", "dots");

    let startYear = d3.min(data, d => d.year);
    let endYear = d3.max(data, d => d.year);
    let rangeEnabled = true;
    const updateGraph = () => {
        svg.selectAll("path").remove();
        dots.selectAll("circle").remove();
        svg.selectAll(".range-highlight").remove();
        svg.selectAll(".change-rect").remove();
        svg.selectAll(".tooltip-bg").remove(); // Clear tooltips
        svg.selectAll(".tooltip-text").remove();


        if (rangeEnabled) {
            svg.append("line")
                .attr("class", "range-highlight")
                .attr("x1", x(startYear))
                .attr("y1", 0)
                .attr("x2", x(startYear))
                .attr("y2", HABITATS_HEIGHT)
                .attr("stroke", "green")
                .attr("stroke-width", 2);

            svg.append("line")
                .attr("class", "range-highlight")
                .attr("x1", x(endYear))
                .attr("y1", 0)
                .attr("x2", x(endYear))
                .attr("y2", HABITATS_HEIGHT)
                .attr("stroke", "green")
                .attr("stroke-width", 2);
        }

        activeGroups.forEach(groupName => {
            const groupData = groups.get(groupName);

            svg.append("path")
                .datum(groupData)
                .attr("fill", "none")
                .attr("stroke", color(groupName))
                .attr("stroke-width", 1.5)
                .attr("opacity", rangeEnabled ? 0.2 : 1)
                .attr("d", line)
                .attr("class", "graph-path");

            const visiblePoints = groupData.filter(d => d.year >= startYear && d.year <= endYear);

            svg.append("path")
                .datum(visiblePoints)
                .attr("fill", "none")
                .attr("stroke", color(groupName))
                .attr("stroke-width", 1.5)
                .attr("opacity", 1)
                .attr("d", line)
                .attr("class", "graph-path-in-range");

            if (rangeEnabled) {
                const startValue = groupData.find(d => d.year === startYear)?.sbi;
                const endValue = groupData.find(d => d.year === endYear)?.sbi;

                if (startValue !== undefined && endValue !== undefined) {
                    const change = ((endValue - startValue) / startValue) * 100;
                    const rectHeight = Math.abs(y(startValue) - y(endValue));
                    const rectY = y(Math.max(startValue, endValue));
                    const toolTipColor = change > 0 ? "green" : "red";
                    const rectColor = color(groupName); // Match graph color
                    const tooltipText = `${groupName}: ${change.toFixed(2)}%`;

                    const textWidth = tooltipText.length * 6.5;
                    const tooltipPadding = 10;
                    const tooltipWidth = textWidth + tooltipPadding * 2;
                    const tooltipHeight = 25;
                    const tooltipX = Math.min(HABITATS_WIDTH - tooltipWidth, x(endYear) + 10);
                    const tooltipY = rectY - tooltipHeight - 5;

                    svg.append("rect")
                        .attr("class", "change-rect")
                        .attr("x", x(startYear))
                        .attr("width", x(endYear) - x(startYear))
                        .attr("y", rectY)
                        .attr("height", rectHeight)
                        .attr("fill", rectColor)
                        .attr("opacity", 0.3);

                    svg.append("rect")
                        .attr("class", "tooltip-bg")
                        .attr("x", tooltipX)
                        .attr("y", tooltipY)
                        .attr("width", tooltipWidth)
                        .attr("height", tooltipHeight)
                        .attr("fill", "white")
                        .attr("stroke", toolTipColor)
                        .attr("stroke-width", 1)
                        .attr("rx", 5)
                        .attr("ry", 5)
                        .attr("opacity", 0.9)
                        .style("z-index", 1000);

                    svg.append("text")
                        .attr("class", "tooltip-text")
                        .attr("x", tooltipX + tooltipWidth / 2)
                        .attr("y", tooltipY + tooltipHeight / 2 + 4)
                        .attr("text-anchor", "middle")
                        .attr("fill", toolTipColor)
                        .style("font-size", "12px")
                        .style("font-weight", "bold")
                        .text(tooltipText);
                }
            }

            dots.selectAll(`.dot-${groupName}`)
                .data(groupData)
                .enter()
                .append("circle")
                .attr("class", `dot-${groupName}`)
                .attr("cx", d => x(d.year))
                .attr("cy", d => y(d.sbi))
                .attr("r", 4)
                .attr("fill", color(groupName))
                .attr("opacity", d => (d.year >= startYear && d.year <= endYear ? 1 : 0.2))
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`Group: ${d.e}<br>Year: ${d.year}<br>SBI Index: ${d.sbi.toFixed(2)}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });
    };


    const addRangeInteraction = () => {
        const drag = d3.drag()
            .on("drag", function(event) {
                const newYear = Math.round(x.invert(event.x));

                if (d3.select(this).classed("start-handle")) {
                    if (newYear < endYear && newYear >= d3.min(data, d => d.year)) {
                        startYear = newYear;
                        d3.select(this).attr("cx", x(startYear));
                        updateGraph();
                    }
                } else if (d3.select(this).classed("end-handle")) {
                    if (newYear > startYear && newYear <= d3.max(data, d => d.year)) {
                        endYear = newYear;
                        d3.select(this).attr("cx", x(endYear));
                        updateGraph();
                    }
                }
            });

        svg.append("circle")
            .attr("class", "start-handle")
            .attr("cx", x(startYear))
            .attr("cy", HABITATS_HEIGHT + 10)
            .attr("r", 8)
            .attr("fill", "#0f270f")
            .call(drag);

        svg.append("circle")
            .attr("class", "end-handle")
            .attr("cx", x(endYear))
            .attr("cy", HABITATS_HEIGHT + 10)
            .attr("r", 8)
            .attr("fill", "#0f270f")
            .call(drag);
    };

    const controls = d3.select("#controls");
    controls.append("button")
        .attr("class", "range-button")
        .text("Show %")
        .on("click", function() {
            rangeEnabled = !rangeEnabled;
            d3.select(this).classed("active", rangeEnabled);
            if (rangeEnabled) {
                addRangeInteraction();
            } else {
                svg.selectAll(".start-handle, .end-handle").remove();
            }
            updateGraph();
        });
    if (rangeEnabled) {
        addRangeInteraction();
    }

    controls.selectAll(".group-button")
        .data(groupNames)
        .enter()
        .append("button")
        .attr("class", "habitat-button")
        .text(d => d)
        .each(function(d) {
            d3.select(this).append("span")
                .attr("class", "checkmark")
                .text("✔");
            d3.select(this).insert("img", ":first-child")
                .attr("class", "group-icon")
                .attr("src", ICONS_PATHS[d])
                .attr("alt", `${d} icon`)
                .style("width", "20px")
                .style("height", "20px")
                .style("margin-right", "8px")
                .style("vertical-align", "middle");

        })
        .on("click", function(event, groupName) {
            if (activeGroups.has(groupName)) {
                activeGroups.delete(groupName);
                d3.select(this).select(".checkmark").style("display", "none");
            } else {
                activeGroups.add(groupName);
                d3.select(this).select(".checkmark").style("display", "inline");
            }
            updateGraph();
        });

    updateGraph();
}
