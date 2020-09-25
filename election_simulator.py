import pandas as pd
import numpy as np
from time import time
import numpy.polynomial.polynomial as poly
from polling_error import polling_error_coeffs

def run_simulations(num=100000):
    date = np.datetime64('today')
    election_date = np.datetime64('2020-11-03')
    coeffs = polling_error_coeffs()
    poll_error = poly.polyval((election_date-date).astype(int), coeffs)
    print(poll_error)

    electoral_votes = pd.read_csv("data/electoral_votes.csv", header=0)
    polling_averages = pd.read_csv("data/polling_averages.csv")
    territories = polling_averages["territories"]
    new_margin = polling_averages["new_margin"]
    score_matrix = pd.read_csv("data/state_weights.csv", index_col="Geography").to_numpy()
    simulations = []
    start_time = time()
    for x in range(40000):
        variations = np.random.normal(scale=poll_error, size=[57])
        # for num,x in enumerate(score_matrix):
        #     diff_sum = 0
        #     for n, y in enumerate(x):
        #         diff_sum += y * variations[n]
        #         print(polling_averages["territories"][num], polling_averages["territories"][n], diff_sum, score_matrix[num][n], variations[n])
        new_variations = np.dot(score_matrix, variations)
        simulations.append(new_variations)
    # print(time() - start_time)
    # start_time = time()
    simulations = pd.DataFrame(simulations) + new_margin
    simulations.columns = territories
    with open("data/simulations.csv", "w") as f:
        f.write(simulations.to_csv(index=False))
    print(time() - start_time)
    print(simulations)
    print(len(simulations[simulations.iloc[:,0] < 0]))

def analyze_simulations(simulations):
    """
    Given a spread of simulations, extracts useful data
    Args:
        simulations - pd.DataFrame with rows being simulations,
            columns being states, and values being margins for Biden
    """
if __name__ == "__main__":
    run_simulations()
    simulations = pd.read_csv("data/simulations.csv")
    print(simulations)