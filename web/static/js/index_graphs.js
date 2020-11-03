function loadWinChance() {
    newDemDataset = {
        label: "Biden",
        data: [],
        fill: false,
        borderColor: getCssletiable("--dem-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--dem-bg"),
    }

    newRepDataset ={
        label: "Trump",
        data: [],
        fill: false,
        borderColor: getCssletiable("--rep-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--rep-bg"),
    }

    Object.values(GLOBAL_DATA["dem_win_chance"]).forEach(key => {
        val = key["dem"]
        newDemDataset.data.push((val*100).toFixed(3))
        newRepDataset.data.push((100-val*100).toFixed(3))
    })

    let muteColor = "rgb(40, 60, 70)";
    let gridLineColor = Array(11).fill(muteColor);
    gridLineColor[5] = getCssletiable("--section-bg");

    lineConfig.data.datasets.splice(0,2);
    lineConfig.data.datasets.push(newDemDataset, newRepDataset)
    lineConfig.options.scales.yAxes[0].ticks.max = 100;
    lineConfig.options.scales.yAxes[0].ticks.stepSize = 10;
    lineConfig.options.scales.yAxes[0].gridLines.color = gridLineColor;
    lineConfig.options.scales.yAxes[0].ticks.callback = function(value, index, values) {
        return value + '%';
    };
    configuredLineChart.update()
}

function loadEV() {
    newDemDataset = {
        label: "Biden",
        data: [],
        fill: false,
        borderColor: getCssletiable("--dem-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--dem-bg"),
    }

    newRepDataset = {
        label: "Trump",
        data: [],
        fill: false,
        borderColor: getCssletiable("--rep-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--rep-bg"),
    }

    Object.values(GLOBAL_DATA["percentile_ev"]).forEach(key => {
        val = key["median"]
        newDemDataset.data.push((val))
        newRepDataset.data.push((538-val))
    })

    lineConfig.data.datasets.splice(0,2)
    lineConfig.data.datasets.push(newDemDataset, newRepDataset)

    let muteColor = "rgb(40, 60, 70)";
    let gridLineColor = Array(11).fill(muteColor);
    gridLineColor[5] = getCssletiable("--section-bg");

    lineConfig.options.scales.yAxes[0].ticks.max = 538;
    lineConfig.options.scales.yAxes[0].ticks.stepSize = 54;
    lineConfig.options.scales.yAxes[0].gridLines.color = gridLineColor;
    lineConfig.options.scales.yAxes[0].ticks.callback = function(value, index, values) {
        return value;
    };

    configuredLineChart.update()
}

function loadPV() {
    newDemDataset = {
        label: "Biden",
        data: [],
        fill: false,
        borderColor: getCssletiable("--dem-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--dem-bg"),
    }

    newRepDataset = {
        label: "Trump",
        data: [],
        fill: false,
        borderColor: getCssletiable("--rep-bg"),
        borderWidth: 5,
        backgroundColor: getCssletiable("--rep-bg"),
    }

    Object.values(GLOBAL_DATA["percentile_state_margins"]).forEach(key => {
        val = key["national"][1]
        newDemDataset.data.push((50+(val/2)).toFixed(3))
        newRepDataset.data.push((50-(val/2)).toFixed(3))
    })

    let muteColor = "rgb(40, 60, 70)";
    let gridLineColor = Array(11).fill(muteColor);
    gridLineColor[5] = getCssletiable("--section-bg");

    lineConfig.data.datasets.splice(0,2)
    lineConfig.data.datasets.push(newDemDataset, newRepDataset)
    lineConfig.options.scales.yAxes[0].ticks.max = 100;
    lineConfig.options.scales.yAxes[0].ticks.stepSize = 10;
    lineConfig.options.scales.yAxes[0].gridLines.color = gridLineColor;
    lineConfig.options.scales.yAxes[0].ticks.callback = function(value, index, values) {
        return value + '%';
    };
    
    configuredLineChart.update()
}

// let configuredLineChart;
let lineConfig;
function loadLineChart(){
    let chart = document.getElementById('win_chance_chart');

    WinChanceDict = {};
    Object.keys(GLOBAL_DATA["dem_win_chance"]).forEach(key => {
        let value = GLOBAL_DATA["dem_win_chance"][key]["dem"]
        WinChanceDict[key] = value;
    })

    let labels = []
    let demWinChance = []
    let repWinChance = []
    
    Object.keys(WinChanceDict).forEach(key => {
        newKey = key.slice(5, 7) + '/' + key.slice(8, 10) + ' ' + key.slice(-2) + 'H'
        labels.push(newKey)
        val = WinChanceDict[key]
        demWinChance.push((val*100).toFixed(3))
        repWinChance.push((100-val*100).toFixed(3))
    })

    let muteColor = "rgb(40, 60, 70)";
    let brightColor = getCssletiable("--section-bg");

    let gridLineColor = Array(11).fill(muteColor)
    gridLineColor[5] = brightColor;

    lineConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Biden",
                data: demWinChance,
                fill: false,
                borderColor: getCssletiable("--dem-bg"),
                borderWidth: 5,
                backgroundColor: getCssletiable("--dem-bg")
            },
            {
                label: "Trump",
                data: repWinChance,
                fill: false,
                borderColor: getCssletiable("--rep-bg"),
                borderWidth: 5,
                backgroundColor: getCssletiable("--rep-bg")
            }]
        },
        options: {
            responsive: true,
            tooltips: {
                intersect: false
            },
            legend: {
                fontColor: getCssletiable("--section-bg"),
                labels: {
                    padding: 20
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0.0,
                        max: 100,
                        fontColor: getCssletiable("--section-bg"),
                        stepSize: 10,
                        callback: function(value, index, values) {
                            return value + '%';
                        }
                    },
                    gridLines: {
                        color: gridLineColor
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: getCssletiable("--section-bg"),
                        minRotation: 45
                    },
                    gridLines: {
                        color: muteColor
                    }
                }]
            }
        }
    };

    configuredLineChart = new Chart(chart, lineConfig);
}


let configuredBarChart;

function loadHistogram(index=TOTAL_ENTRIES-1) {
    // Chart.defaults.global.animation.duration = 1000
    let histogram = document.getElementById("ev_histogram_chart")
    if(configuredBarChart) {
        configuredBarChart.destroy();
    }

    let dataMin = 538;
    let dataMax = 0;

    for (let i = 0; i <= TOTAL_ENTRIES-1; i++) {
        evHistogramData = GetNthEntry(GLOBAL_DATA["ev_histogram"], i)
        let min = Object.keys(evHistogramData)[0]
        let max = Object.keys(evHistogramData)[Object.keys(evHistogramData).length - 1]
        if (min < dataMin) {
            dataMin = min;
        }
        if (max > dataMax) {
            dataMax = max;
        }
    }
    dataMin = 0;
    dataMax = 538;
    EV_HISTOGRAM = GetNthEntry(GLOBAL_DATA["ev_histogram"], index)
    
    let indexBeginning = Object.keys(EV_HISTOGRAM)[0]
    for (let i = dataMin; i < indexBeginning; i++){
        EV_HISTOGRAM[i] = 0;
    }
    
    let indexEnd = Number(Object.keys(EV_HISTOGRAM)[Object.keys(EV_HISTOGRAM).length - 1])+1
    for (let i = indexEnd; i <= dataMax; i++){
        EV_HISTOGRAM[i] = 0;
    }
    
    let tippingPointIndex;
    for (let i = 0; i < Object.keys(EV_HISTOGRAM).length; i++){
        if (Object.keys(EV_HISTOGRAM)[i] == 269) {
            tippingPointIndex = i;
        }
    }

    let gridBarColor = Array(tippingPointIndex).fill(getCssletiable("--rep-bg"))
    gridBarColor.push("rgb(255,255,255)")
    gridBarColor.push.apply(gridBarColor, Array(Object.keys(EV_HISTOGRAM).length - tippingPointIndex - 1).fill(getCssletiable("--dem-bg")))
    gridBarColor[0] = getCssletiable("--section-bg")
    gridBarColor[gridBarColor.length - 1] = getCssletiable("--section-bg")

    let fontColor = "rgb(255,255,255)"
    let ticks = linspace(dataMin, dataMax, 15)
    ticks.push("269")

    let barConfig = {
        type: 'bar',
        data: {
            labels: Object.keys(EV_HISTOGRAM),
            datasets: [{
                label: "Number of Simulations",
                data: Object.values(EV_HISTOGRAM),
                fill: false,
                borderColor: gridBarColor,
                borderWidth: 5,
                backgroundColor: gridBarColor,
                barPercentage: 1,
                categoryPercentage: 1,
                barThickness: 'flex',
            }, ]
        },
        options: {
            // padding: "50",
            responsive: true,
            tooltips: {
                intersect: false,
                mode: "index",
                enabled: false,
                custom: EVTooltip,
            },
            title: {
                text: "Democratic EVs",
                display: true,
                fontColor: fontColor
            },
            legend: {
                display: false
            },
            layout: {
                padding: {
                    left: 75,
                    right: 75,
                    top: 30,
                    bottom: 10,
                }
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "% of Simulations",
                        fontColor: fontColor,
                        padding: 20,
                    },
                    ticks: {
                        min: -0.0,
                        max: 2000,
                        fontColor: fontColor,
                        callback: function(value, index, values) {
                            return String((value/500).toFixed(2)) + "%";
                        }
                    },
                    gridLines: {
                        // color: fontColor,
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: fontColor,
                        minRotation: 0,
                        maxRotation: 45,
                        // stepSize: dataMax-dataMin,
                        // maxTicksLimit: 20,
                        min: 0,
                        max: 538,
                        autoSkip: false,
                        beginAtZero: true,
                        // afterBuildTicks: function(setTicks) {
                        //     setTicks = ticks;
                        //     return;
                        // },
                        // beforeUpdate: function(oScale) {
                        //     return;
                        // },
                        callback: function(value, index, values) {
                            if (ticks.includes(value)) {
                                return value;
                            }
                            else {
                                return;
                            }
                        }
    
                    },
                    gridLines: {
                        color: getCssletiable("--card-bg"),
                    }
                }]
            }
        }
    };
    configuredBarChart = new Chart(histogram, barConfig);
}