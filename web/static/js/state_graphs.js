
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

    let stateTickColors = Array(6).fill("#6E90FF").concat(Array(7).fill("#FF6868"))
    stateTickColors[5] = "#FFFFFF"
    // stateTickColors[0] = "000000"

    console.log(stateTickColors)
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
                callback: function(value, index, values) {
                    return Math.abs(value) + '%';
                },
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
                        // fontColor: getCssletiable("--section-bg"),
                        // stepSize: 10,
                        callback: function(value, index, values) {
                            return Math.abs(value) + '%';
                        },
                        // fontColor: stateTickColors
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
        stateLineConfig.options.scales.yAxes[0].ticks.fontColor = stateTickColors 
        stateLineConfig.options.scales.yAxes[0].ticks.callback = function(value, index, values) {
            return Math.abs(value) + '%';
        }, 
        stateLineConfig.options.scales.yAxes[0].gridLines.color = stateTickColors
        stateLineConfig.options.scales.yAxes[0].gridLines.zeroLineColor = "rgb(255, 255, 255)"
        stateLineConfig.options.scales.xAxes[0].gridLines.zeroLineColor = "rgb(255,255,255)"
    }
    else {
        stateLineConfig.options.scales.yAxes[0].ticks.min = -0.0
        stateLineConfig.options.scales.yAxes[0].ticks.max = 100
        stateLineConfig.options.scales.yAxes[0].ticks.stepSize = 10
        stateLineConfig.options.scales.yAxes[0].ticks.fontColor = stateTickColors
        stateLineConfig.options.scales.yAxes[0].ticks.callback = function(value, index, values) {
            if (value < 50) {
                return Math.abs(value-50)+ 50 + '%';
            }
            else {
                return Math.abs(value) + '%';
            }
        }, 
        stateLineConfig.options.scales.yAxes[0].gridLines.color = stateTickColors
        stateLineConfig.options.scales.yAxes[0].gridLines.zeroLineColor = "rgb(255, 104, 104)"
        stateLineConfig.options.scales.xAxes[0].gridLines.zeroLineColor = "rgb(255,255,255)"
    }
    console.log(stateLineConfig)
    for (let state of stateResults) {
        addGraphState(state, mode)
    }
    configuredStateLineChart = new Chart(graph, stateLineConfig);
    configuredStateLineChart.update(); 
}

function retrieveData(states, mode) {
    /*
    states is an array of strings that represent state abbreviations
    mode is an argument that either takes "pv" or doesn't depending on which mode
    to set the graph to
    */
   console.log(states)
    let data = {}
    if (mode == "pv") {
        Object.keys(STATE_MARGINS).forEach(time => {
            let sum = 0;
            states.forEach(state => {
                let value = STATE_MARGINS[time][STATEUNABBR[state]][1]
                sum += value;
            })
            
            data[time] = (sum/states.length).toFixed(3);
        })
    }
    else {
        Object.keys(STATE_CHANCES).forEach(time => {
            let sum = 0
            states.forEach(state => {
                let value = STATE_CHANCES[time][STATEUNABBR[state]]
                sum += value;
            })
            data[time] = (100 * sum/states.length).toFixed(3);
        })
    }
    console.log(data)
    return data;
}

function addGraphState(state, mode) {
    let data;
    if (state == "SE") {
        data = retrieveData(["SC", "GA", "FL", "NC", "VA",], mode)
    }
    else if (state == "GP") {
        data = retrieveData(["MO", "KS", "NE-1", "NE-2", "IA", "AK", "MT", "IN"], mode)
    }
    else if (state == "SW") {
        data = retrieveData(["NV", "AZ", "CO", "NM", "TX"], mode)
    }
    else if (state == "NO") {
        data = retrieveData(["MN", "WI", "MI", "PA", "OH", "NE", "ME-2"], mode)
    }
    else {
        data = retrieveData([state], mode)
    }
    let currentDataColors = []
    let dataColor = dataColors[(stateResults.indexOf(state)) % dataColors.length]
    
    console.log(STATEUNABBR[state])
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
    console.log(stateColors, state)
    dataset.splice(stateResults.indexOf(state),1);
    console.log(dataset)
    for (let i = 0; i < dataset.length; i++) {
        dataset[i]["pointBackgroundColor"] = dataColors[i % DATA_COLORS_LEN]
        dataset[i]["pointBorderColor"] = dataColors[i % DATA_COLORS_LEN]
        dataset[i]["borderColor"] = dataColors[i % DATA_COLORS_LEN]
    }
    console.log(stateResults)
    configuredStateLineChart.update(); 
}

function addStateLineChart(state, mode) {
    addGraphState(state, mode)
    configuredStateLineChart.update(); 
}
