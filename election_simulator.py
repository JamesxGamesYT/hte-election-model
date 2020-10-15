import pandas as pd
import numpy as np
from time import time
import json
import os
import numpy.polynomial.polynomial as poly
from polling_error import polling_error_coeffs

def run_simulations(num=50000, write=False):
    date = np.datetime64('today')
    election_date = np.datetime64('2020-11-03')
    coeffs = polling_error_coeffs()
    poll_error = poly.polyval((election_date-date).astype(int), coeffs)

    polling_averages = pd.read_csv("data/polling_averages.csv")
    territories = polling_averages["territories"]
    new_margin = polling_averages["new_margin"]

    score_matrix = pd.read_csv("data/state_weights.csv", index_col="Geography").to_numpy()
    score_matrix = np.apply_along_axis(lambda x : np.power(x, 1/3), 1, score_matrix)
    simulations = []
    for _ in range(num):
        variations = np.random.normal(scale=poll_error, size=[57])
        # for num,x in enumerate(score_matrix):
        #     diff_sum = 0
        #     for n, y in enumerate(x):
        #         diff_sum += y * variations[n]
        #         print(polling_averages["territories"][num], polling_averages["territories"][n], diff_sum, score_matrix[num][n], variations[n])
        new_variations = np.dot(score_matrix, variations)
        simulations.append(new_variations)
    simulations = pd.DataFrame(simulations) + new_margin
    simulations.columns = territories

    if write == True:
        with open("data/simulations.csv", "w") as f:
            f.write(simulations.to_csv(index=False))
    else:
        return simulations

def analyze_simulations(simulations, state_conditionals=None, write=False):
    """
    Given a spread of simulations, extracts useful data
    Args:
        simulations - pd.DataFrame with rows being simulations,
            columns being states, and values being margins for Biden
        state_conditionals - dict with keys being states and values being
            ints 0, or 1, where 0 indicates Trump wins that state, 
            and 1 indicates Joe Biden wins that state. If applicable, 
            calculates results based on the conditional wins in this argument.
    """
    electoral_votes = pd.read_csv("data/electoral_votes.csv", header=0)["ev"]
    modified_simulations = simulations
    binary_matrix = (modified_simulations > 0).astype(int)
    if state_conditionals:
        for state, win in state_conditionals.items():
            modified_simulations = modified_simulations[binary_matrix[state] == win]
            binary_matrix = (modified_simulations > 0).astype(int)
        pass
    
    encoder = np.logspace(56, 0, num=57, base=2)
    sim_ev = np.dot(binary_matrix, electoral_votes)
    most_common_simulations = {}
    for i in range(len(pd.Series(sim_ev).value_counts())):
        if pd.Series(sim_ev).value_counts().iloc[i] == 0:
            continue
        ev = pd.Series(sim_ev).value_counts().index[i]
        arr = []
        simulations_dict = {}
        # print(len(binary_matrix[sim_ev == ev]))
        for j in range(len(binary_matrix[sim_ev == ev])):
            simulation = binary_matrix[sim_ev == ev].iloc[j]
            checksum = np.dot(encoder, simulation.to_numpy())
            arr.append(checksum)
            simulations_dict[checksum] = simulation
        most_common = simulations_dict[pd.Series(arr).value_counts().index[0]]
        most_common_simulations[str(ev)] = json.loads(most_common.to_json())
    if write == True:
        with open("web/results/simulations_by_ev.json", "w") as f:
            f.write(json.dumps(most_common_simulations, indent=4))

    dem_win_chance = len(sim_ev[sim_ev > 270])/len(modified_simulations)    
    state_chances = [sum(binary_matrix.iloc[:,x])/len(binary_matrix) for x in range(57)]

    twentytiles = [pd.qcut(modified_simulations.iloc[:,x], 20).value_counts().index.to_list() for x in range(57)]
    five_percentile = [min([twentytiles[y][x].right for x in range(len(twentytiles[0]))]) for y in range(len(twentytiles))]
    medians = modified_simulations.median().to_list()
    ninety_five_percentile = [max([twentytiles[y][x].left for x in range(len(twentytiles[-1]))]) for y in range(len(twentytiles))]
    percentile_state_margins = list(zip(five_percentile, medians, ninety_five_percentile))
    ev_percentile_array = pd.qcut(sim_ev, 20, duplicates="drop").value_counts().index.to_list()

    five_ev = ev_percentile_array[0].right
    median_ev = np.median(sim_ev)
    ninety_five_ev = ev_percentile_array[-1].left
    percentile_ev = (five_ev, median_ev, ninety_five_ev)
    
    sorted_margins = pd.Series([modified_simulations.iloc[x].sort_values() for x in range(len(modified_simulations))])
    sorted_index = pd.Series([modified_simulations.iloc[x].argsort() for x in range(len(modified_simulations))])
    tipping_point_margins = []
    tipping_point_states = []
    for sim_num, sim in enumerate(sorted_margins):
        ev_sum = 0
        for num in range(len(sim)):
            ev_sum += electoral_votes[sorted_index[sim_num][num]]
            # print(ev_sum)
            if ev_sum >= 270:
                tipping_point_margins.append(sim[num])
                tipping_point_states.append(sim.index[num])
                break

    tipping_point_margins = pd.Series(tipping_point_margins)
    tipping_point_states = pd.Series(tipping_point_states)
    average_tipping_point = round(tipping_point_margins.median(), 3)
    state_tipping_points = []
    for state in tipping_point_states.value_counts().index:
        state_tipping_points.append(tipping_point_margins[tipping_point_states == state].median()) 
    tipping_point_state_data = list(zip(tipping_point_states.value_counts().index.to_list(), (tipping_point_states.value_counts()/len(modified_simulations)).to_list(), state_tipping_points))
    tipping_point_data = (average_tipping_point, round((tipping_point_margins - modified_simulations.iloc[:, 0]).median(),3))
    
    ev_histogram = pd.cut(sim_ev, np.linspace(min(sim_ev)-6, max(sim_ev)+5, num=max(sim_ev)-min(sim_ev)+12)).value_counts()
    ev_histogram_tuple = list(zip([category.right for category in ev_histogram.index], ev_histogram.to_list()))
    ev_histogram_dict = {int(lists[0]) : lists[1] for lists in ev_histogram_tuple}

    time = np.datetime64(np.datetime64('now'), 'h')
    time_string = np.datetime_as_string(time, unit='h')

    dem_win_chance = json.loads(pd.Series(dem_win_chance, index=["dem"]).to_json())
    state_chances = json.loads(pd.Series(state_chances, index=modified_simulations.columns).to_json())
    tipping_point_state_data = json.loads(pd.Series(tipping_point_state_data).to_json())
    tipping_point_data = json.loads(pd.Series(tipping_point_data, index=["average tipping point", "pop-ev split"]).to_json())
    percentile_ev = json.loads(pd.Series(percentile_ev, index=["5 percentile", "median", "95 percentile"]).to_json())
    percentile_state_margins = json.loads(pd.Series(percentile_state_margins, index=modified_simulations.columns).to_json())
    ev_histogram = json.loads(pd.Series(ev_histogram_dict).to_json())

    json_files = {}
    json_files["web/results/dem_win_chance.json"] = dem_win_chance
    json_files["web/results/state_chances.json"] = state_chances
    json_files["web/results/tipping_point_state_data.json"] = tipping_point_state_data
    json_files["web/results/tipping_point_data.json"] = tipping_point_data
    json_files["web/results/percentile_ev.json"] = percentile_ev
    json_files["web/results/percentile_state_margins.json"] = percentile_state_margins
    json_files["web/results/ev_histogram.json"] = ev_histogram

    if write == True:
        for path, data in json_files.items():
            try:
                with open(path, "r") as f:
                    current = json.loads(f.read())
                _ = list(current.keys())[0]
                if list(current.keys())[-1] != time_string:
                    current[time_string] = data
            except:
                current = {}
                current[time_string] = data
            with open(path, "w") as f:
                f.write(json.dumps(current, indent=4))

    else:
        return state_chances, tipping_point_state_data, tipping_point_data, percentile_ev, percentile_state_margins, ev_histogram

if __name__ == "__main__":
    run_simulations(write=True)
    simulations = pd.read_csv("data/simulations.csv")
    analyze_simulations(simulations, write=True)