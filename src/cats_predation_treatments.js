//TODO consider doing that in data cleanup phase?
// chosen as 14, since the "phase" was defined as 2 weeks in the paper - see page 3

const STANDARD_DURATION = 14;

//TODO consider parsing that from csv dynamically? Benefits?
const PREY_TYPES = ["Birds", "Insects", "Mammals", "Reptiles"];
const SVG_PATHS = {
    Birds: "./resources/bird.svg",
    Insects: "./resources/insect.svg",
    Mammals: "./resources/mammal.svg",
    Reptiles: "./resources/reptile.svg"
};
const SVG_WIDTH = 600;
const SVG_HEIGHT = 300;
const MARGIN = { top: 40, right: 20, bottom: 70, left: 60 };
const WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

// load data
d3.csv("./data/clean/cleaned_cats_predation.csv").then(data => {
    data.forEach(d => {
        d.No_Prey = +d['No.Prey'];
        d.Duration = +d.Duration;
        d.Normalized_Prey = d.No_Prey * (STANDARD_DURATION / d.Duration);
    });
    drawChart(data);
}).catch(error => console.log(error));

function drawChart(data) {
    let selectedPreyType = PREY_TYPES[0];

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("display", "none")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "10px")
        .style("border-radius", "5px");

    createPreyButtons();

    const svg = d3.select("#cat-predation-chart").append("svg")
        .attr("width", SVG_WIDTH)
        .attr("height", SVG_HEIGHT);

    const g = svg.append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const xScale = d3.scaleBand().range([0, WIDTH]).padding(0.2);
    const yScale = d3.scaleLinear().range([HEIGHT, 0]);
    const xAxisGroup = g.append("g").attr("transform", `translate(0,${HEIGHT})`);
    const yAxisGroup = g.append("g");

    const chartTitle = svg.append("text")
        .attr("class", "chart-title")
        .attr("x", WIDTH / 2 + MARGIN.left)
        .attr("y", MARGIN.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", `translate(${WIDTH / 2 + MARGIN.left},${HEIGHT + MARGIN.top + 50})`)
        .style("text-anchor", "middle")

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", MARGIN.left - 50)
        .attr("x", -HEIGHT / 2 - MARGIN.top)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(" Total number of Prey per Phase");

    //initial chart rendering
    updateChart();

    function updateChart() {
        const chartData = getChartData(selectedPreyType);

        xScale.domain(chartData.map(d => d.Treatment));
        yScale.domain([0, d3.max(chartData, d => d.TotalPrey) * 1.1]);

        xAxisGroup.call(d3.axisBottom(xScale));
        yAxisGroup.call(d3.axisLeft(yScale));

        const bars = g.selectAll(".bar")
            .data(chartData, d => d.Treatment);

        bars.join(
            enter => enter.append("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(d.Treatment))
                .attr("y", yScale(0))
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .on("mouseover", (event, d) => {
                    d3.select(event.currentTarget).attr("fill", "#40a9f3");
                    tooltip.style("display", "block")
                        .html(`<strong>Treatment:</strong> ${d.Treatment}<br><strong>Total Prey:</strong> ${d.TotalPrey}`)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 10}px`);
                })
                .on("mouseout", event => {
                    tooltip.style("display", "none");
                    d3.select(event.currentTarget).attr("fill", null);
                })
                .call(enter => enter.transition()
                    .duration(500)
                    .attr("y", d => yScale(d.TotalPrey))
                    .attr("height", d => HEIGHT - yScale(d.TotalPrey))),
            update => update.call(update => update.transition()
                .duration(500)
                .attr("x", d => xScale(d.Treatment))
                .attr("y", d => yScale(d.TotalPrey))
                .attr("width", xScale.bandwidth())
                .attr("height", d => HEIGHT - yScale(d.TotalPrey))),
            exit => exit.remove()
        );

    }

    function getChartData(preyType) {
        const filteredData = data.filter(d => d.PreyTaxon === preyType);
        return Array.from(d3.rollup(
            filteredData,
            v => d3.sum(v, d => d.No_Prey),
            d => renameTreatment(d.Treatment)
        ), ([Treatment, TotalPrey]) => ({ Treatment, TotalPrey }));
    }
    function renameTreatment(treatment) {
        switch (treatment) {
            case 'BBS': return 'Collar';
            case 'BBS_Bell': return 'Collar + Bell';
            case 'No_BBS': return 'No treatment';
            default: return treatment;
        }
    }

    function createPreyButtons() {
        const buttonContainer = d3.select("#button-container");

        const buttonGroups = buttonContainer.selectAll(".button-svg-container")
            .data(PREY_TYPES)
            .enter()
            .append("div")
            .attr("class", "button-svg-container");

        buttonGroups.append("button")
            .attr("class", "prey-button")
            .classed("active", d => d === selectedPreyType)
            .text(d => d)
            .on("click", (event, d) => {
                selectedPreyType = d;
                updateChart();
                d3.selectAll(".prey-button").classed("active", btnData => btnData === d);
            });

        buttonGroups.each(function(d) {
            const container = d3.select(this);
            d3.xml(SVG_PATHS[d]).then(data => {
                container.node().appendChild(data.documentElement);
                d3.select(container.node().lastChild)
                    .attr("width", 50)
                    .attr("height", 50);
            }).catch(() => console.log("SVG not found"));
        });
    }
}
