
let configuredStateLineChart;
let StateLineConfig;

let DATA_COLORS_LEN = 25
dataColors = [
    "rgb(111, 175, 103)",
]
for (i = 0; i < DATA_COLORS_LEN; i++) {
    let color = dataColors[dataColors.length-1]

    let endIndex = color.indexOf(",", 4) 
    let red = String((Number(color.slice(4,endIndex)) + 80) % 256)

    let previousEndIndex = endIndex + 2
    endIndex = color.indexOf(",", endIndex+1)
    let green = String((Number(color.slice(previousEndIndex,endIndex)) + 50) % 256)

    previousEndIndex = endIndex + 2
    endIndex = color.indexOf(")", endIndex)
    let blue = String((Number(color.slice(previousEndIndex,endIndex)) + 30) % 256)

    for (let colorType of [red, green, blue]) {
        if (Number(colorType) < 30) {
            colorType = String(Number(colorType) + 30)
        }
    }
    if(Number(blue) > 230) {
        blue = String(256 - Number(blue))
    }

    dataColors.push("rgb(" + red + ", " + green + ", " + blue + ")")
}

Chart.defaults.global.elements.point.radius = 3;
function loadStateLineChart(mode){
    if (configuredStateLineChart) {
        configuredStateLineChart.destroy();
    }
    graph = document.getElementById("state-chart")
    
    let stateGridLineColor = Array(11).fill(getCssletiable("--section-bg"))
    stateGridLineColor[5] = "rgb(255,255,255)"
    // stateGridLineColor[5] = "rgb(0,0,0)"

    console.log(stateGridLineColor)
    let times = []
    Object.keys(STATE_CHANCES).forEach(time => {
        times.push(time)
    })
    stateLineConfig = {
        type: 'line',
        data: {
            labels: times,
            datasets: []
        },
        options: {
            // padding: "50",
            responsive: true,
            tooltips: {
                intersect: false,
                // mode: "index"
            },
            legend: {
                fontColor: getCssletiable("--section-bg"),
                display: false,
            },
            layout: {
                padding: {
                    left: 75,
                    right: 75,
                    // top: 30,
                    bottom: 10,
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        // min: -0.0,
                        // max: 100,
                        fontColor: getCssletiable("--section-bg"),
                        // stepSize: 10,
                        callback: function(value, index, values) {
                            return value + '%';
                        }
                    },
                    gridLines: {
                        // color: stateGridLineColor,
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: getCssletiable("--section-bg"),
                        minRotation: 45,
                    },
                    gridLines: {
                        color: getCssletiable("--section-bg"),
                    }
                }]
            }
        }
    };

    if (mode == "pv") {
        stateLineConfig.options.scales.yAxes[0].ticks.min = -15
        stateLineConfig.options.scales.yAxes[0].ticks.max = 15
        stateLineConfig.options.scales.yAxes[0].ticks.stepSize = 3
        stateLineConfig.options.scales.yAxes[0].gridLines.color = stateGridLineColor
        stateLineConfig.options.scales.yAxes[0].gridLines.zeroLineColor = "rgb(255,255,255)"
    }
    else {
        stateLineConfig.options.scales.yAxes[0].ticks.min = -0.0
        stateLineConfig.options.scales.yAxes[0].ticks.max = 100
        stateLineConfig.options.scales.yAxes[0].ticks.stepSize = 10
        stateLineConfig.options.scales.yAxes[0].gridLines.color = stateGridLineColor
    }
    console.log(stateLineConfig)
    for (let state of stateResults.slice(1)) {
        addGraphState(state, mode)
    }
    configuredStateLineChart = new Chart(graph, stateLineConfig);
    configuredStateLineChart.update(); 
}

function addGraphState(state, mode) {
    let data = {}
    let currentDataColors = []
    let dataColor = dataColors[(stateResults.indexOf(state)-1) % dataColors.length]

    if (mode == "pv") {
        Object.keys(STATE_MARGINS).forEach(time => {
            let value = STATE_MARGINS[time][STATEUNABBR[state]][1]
            data[time] = (value).toFixed(3);
        })
    }
    else {
        Object.keys(STATE_CHANCES).forEach(time => {
            let value = STATE_CHANCES[time][STATEUNABBR[state]]
            data[time] = (value*100).toFixed(3);
        })
    }
    let dataDict = {
        label: capitalize(STATEUNABBR[state]),
        data: Object.values(data),
        fill: false,
        // borderColor: getCssletiable("--card-bg"),
        borderWidth: 5,
        pointBackgroundColor: dataColor,
        pointBorderColor: dataColor,
        borderColor: dataColor,
    }
    stateLineConfig["data"]["datasets"].push(dataDict)
}

function removeGraphState(state) {
    let dataset = configuredStateLineChart["data"]["datasets"]
    dataset.splice(stateResults.indexOf(state)-1,1);
    for (let i = 0; i < dataset.length; i++) {
        dataset[i]["pointBackgroundColor"] = dataColors[i % DATA_COLORS_LEN]
        dataset[i]["pointBorderColor"] = dataColors[i % DATA_COLORS_LEN]
        dataset[i]["borderColor"] = dataColors[i % DATA_COLORS_LEN]
    }
    configuredStateLineChart.update(); 
}

function addStateLineChart(state, mode) {
    addGraphState(state, mode)
    configuredStateLineChart.update(); 
}
