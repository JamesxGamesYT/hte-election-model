import pandas as pd
import numpy as np

cols = ["election", "state", "endDate", "democratic", "republican", "finalTwoPartyVSDemocratic", "finalTwoPartyVSRepublican"]
polls = pd.read_table("polls_auxiliary_dataset.tsv", parse_dates=["endDate"], usecols=cols)
print(polls.head(10))
polls = polls[polls["election"] == "Pres"]
print(polls.describe())