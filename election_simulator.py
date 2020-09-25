import pandas as pd
import numpy as np
from time import time
from math import sqrt
import numpy.polynomial.polynomial as poly
from polling_error import polling_error_coeffs

def run_simulations(num=10000, write=True):
    date = np.datetime64('today')
    election_date = np.datetime64('2020-11-03')
    coeffs = polling_error_coeffs()
    poll_error = poly.polyval((election_date-date).astype(int), coeffs)

    polling_averages = pd.read_csv("data/polling_averages.csv")
    territories = polling_averages["territories"]
    new_margin = polling_averages["new_margin"]

    score_matrix = pd.read_csv("data/state_weights.csv", index_col="Geography").to_numpy()
    score_matrix = np.apply_along_axis(lambda x : np.sqrt(x), 1, score_matrix)
    simulations = []
    for x in range(num):
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

def analyze_simulations(simulations, state_conditionals=None):
    """
    Given a spread of simulations, extracts useful data
    Args:
        simulations - pd.DataFrame with rows being simulations,
            columns being states, and values being margins for Biden
        state_conditionals - dict with keys being states and values being
            ints -1, 0, or 1, where -1 denotes model prediction, 0 
            indicates Trump wins that state, and 1 indicates Joe Biden 
            wins that state. If applicable, calculates results based on
            the conditional wins in this argument.
    """
    electoral_votes = pd.read_csv("data/electoral_votes.csv", header=0)["ev"]
    binary_matrix = (simulations > 0).astype(int)
    if state_conditionals:
        pass
    sim_ev = np.dot(binary_matrix, electoral_votes)
    state_chances = [sum(binary_matrix.iloc[:,x])/len(binary_matrix) for x in range(57)]
    # print(len(sim_ev[sim_ev < 270])/len(simulations))
    twentytiles = [pd.qcut(simulations.iloc[:,x], 20).value_counts().index.to_list() for x in range(57)]
    five_percentile = [min([twentytiles[y][x].right for x in range(len(twentytiles[0]))]) for y in range(len(twentytiles))]
    ninety_five_percentile = [max([twentytiles[y][x].left for x in range(len(twentytiles[-1]))]) for y in range(len(twentytiles))]
    # print(five_percent_confidence)
    medians = simulations.median().to_list()
    # print(data)
    print(len(sim_ev[sim_ev == 269]))

if __name__ == "__main__":
    run_simulations()
    simulations = pd.read_csv("data/simulations.csv")
    analyze_simulations(simulations)