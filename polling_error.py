import pandas as pd
import numpy as np
import numpy.polynomial.polynomial as poly

def polling_error_function():
    """
    Return a np.polynomial.polynomial.Polynomial that outputs
    absolute poll error based on days from election.
    """
    cols = ["election",  "endDate", "electionDate", "democratic", "republican", "finalTwoPartyVSDemocratic", "finalTwoPartyVSRepublican"]
    polls = pd.read_table("polls_auxiliary_dataset.tsv", parse_dates=["endDate", "electionDate"], usecols=cols)
    polls = polls[polls["election"] == "Pres"]
    polls["polls_margin"] = polls["democratic"] - polls["republican"]
    polls["final_margin"] = polls["finalTwoPartyVSDemocratic"] - polls["finalTwoPartyVSRepublican"]
    polls["until_election"] = polls["electionDate"] - polls["endDate"]
    polls["difference"] = (polls["polls_margin"] - polls["final_margin"]).abs()
    polls.drop(columns=["democratic", "republican", "finalTwoPartyVSDemocratic", "finalTwoPartyVSRepublican"], inplace=True)
    difference = polls.loc[:, ["difference", "until_election"]].sort_values("until_election")
    difference = pd.pivot_table(difference, values="difference", index="until_election", aggfunc=np.mean)[::-1]
    difference.reset_index(inplace=True)
    difference["until_election"] = difference["until_election"].dt.days
    coeffs = poly.polyfit(difference["until_election"], difference["difference"], 6)
    polynomial = poly.Polynomial(coeffs)
    return polynomial