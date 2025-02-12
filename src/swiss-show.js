d3.json('../lib/d3-geomap/topojson/switzerland/swiss-maps.json')
    .then(function (data) {
        console.log('Data loaded:', data);

        const yearData = {};
        d3.csv('./data/clean/total_cats.csv').then(function (csvData) {
            csvData.forEach(row => {
                const year = +row['year'];
                yearData[year] = {};
                Object.keys(row).forEach(key => {
                    if (key !== 'year') {
                        yearData[year][key] = +row[key];
                    }
                });
            });

            const svg = d3.select('#map').append('svg')
                .attr('width', 1000)
                .attr('height', 490);

            const projection = d3.geoMercator()
                .scale(9000)
                .center([8.2275, 46.8182]);

            const path = d3.geoPath().projection(projection);

            const tooltip = d3.select('body')
                .append('div')
                .attr('class', 'tooltip')
                .style('position', 'absolute')
                .style('background', '#fff')
                .style('padding', '5px 10px')
                .style('border', '1px solid #ccc')
                .style('border-radius', '5px')
                .style('box-shadow', '0 0 5px rgba(0,0,0,0.3)')
                .style('display', 'none');

            const colorScale = d3.scaleQuantize()
                .domain([0, 50000])
                .range(d3.range(0, 500, 100).map(d => d3.interpolateBlues(d / 500)));

            const updateMap = (year) => {
                console.log('yearData:', yearData);
                const yearPopulation = yearData[year];

                svg.selectAll('path')
                    .data(topojson.feature(data, data.objects.cantons).features)
                    .join('path')
                    .attr('d', path)
                    .attr('fill', d => {
                        const cantonCode = cantonNameToCode[d.properties.name];
                        return colorScale(yearPopulation[cantonCode] || 0);
                    })
                    .attr('stroke', '#000')
                    .attr('stroke-width', 0.5)
                    .on('mouseover', function (event, d) {
                        d3.select(this).attr('stroke-width', 2);

                        const cantonCode = cantonNameToCode[d.properties.name];
                        const catCount = yearPopulation[cantonCode] || 0;

                        d3.select('#hover-info')
                            .html(`Canton: <strong>${d.properties.name}</strong> | Cats: <strong>${catCount}</strong>`);

                        tooltip.style('display', 'block')
                            .html(`<strong>Canton:</strong> ${d.properties.name}<br><strong>Cats:</strong> ${catCount}`);
                    })
                    .on('mousemove', function (event) {
                        tooltip.style('top', `${event.pageY - 10}px`)
                            .style('left', `${event.pageX + 10}px`);
                    })
                    .on('mouseout', function () {
                        d3.select(this).attr('stroke-width', 0.5);

                        d3.select('#hover-info')
                            .html('Hover over a canton to see details');

                        tooltip.style('display', 'none');
                    });
            };

            updateMap(2016);

            const sliderWrapper = d3.select('#map')
                .append('div')
                .attr('id', 'slider-wrapper')
                .style('display', 'flex')
                .style('flex-direction', 'column')
                .style('align-items', 'center')
                .style('width', '100%');

            const slider = sliderWrapper
                .append('input')
                .attr('type', 'range')
                .attr('min', 2016)
                .attr('max', 2024)
                .attr('value', 2016)
                .attr('step', 1)
                .style('width', '50%')
                .on('input', function () {
                    const selectedYear = +this.value;
                    updateMap(selectedYear);
                });

            const sliderContainer = sliderWrapper
                .append('div')
                .style('display', 'flex')
                .style('justify-content', 'space-between')
                .style('width', '50%');

            sliderContainer.append('span').text('2016');
            sliderContainer.append('span').text('2017');
            sliderContainer.append('span').text('2018');
            sliderContainer.append('span').text('2019');
            sliderContainer.append('span').text('2020');
            sliderContainer.append('span').text('2021');
            sliderContainer.append('span').text('2022');
            sliderContainer.append('span').text('2023');
            sliderContainer.append('span').text('2024');

        });
    })
    .catch(function (error) {
        console.error('Error', error);
    });


const cantonNameToCode = {
    "Zürich": "ZH",
    "Bern / Berne": "BE",
    "Luzern": "LU",
    "Uri": "UR",
    "Schwyz": "SZ",
    "Obwalden": "OW",
    "Nidwalden": "NW",
    "Glarus": "GL",
    "Zug": "ZG",
    "Fribourg / Freiburg": "FR",
    "Solothurn": "SO",
    "Basel-Stadt": "BS",
    "Basel-Landschaft": "BL",
    "Schaffhausen": "SH",
    "Appenzell Ausserrhoden": "AR",
    "Appenzell Innerrhoden": "AI",
    "St. Gallen": "SG",
    "Graubünden / Grigioni / Grischun": "GR",
    "Aargau": "AG",
    "Thurgau": "TG",
    "Ticino": "TI",
    "Vaud": "VD",
    "Valais / Wallis": "VS",
    "Neuchâtel": "NE",
    "Genève": "GE",
    "Jura": "JU"
};

const legendWidth = 450;
const legendHeight = 20;

const legendSvg = d3.select('#map')
    .append('svg')
    .attr('width', legendWidth + 50)
    .attr('height', 70)
    .style('margin-top', '10px');

const defs = legendSvg.append('defs');
const linearGradient = defs.append('linearGradient')
    .attr('id', 'legend-gradient');

linearGradient.selectAll('stop')
    .data(d3.range(0, 1.01, 0.01).map(t => ({
        offset: `${t * 100}%`,
        color: d3.interpolateBlues(t)
    })))
    .enter()
    .append('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color);

legendSvg.append('rect')
    .attr('x', 10)
    .attr('y', 30)
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .style('fill', 'url(#legend-gradient)');

const maxPopulation = 72925;
legendSvg.append('text')
    .attr('x', legendWidth + 10)
    .attr('y', 25)
    .attr('text-anchor', 'end')
    .style('font-size', '12px')
    .text(maxPopulation);