import numpy as np 
import pandas as pd 

score_data = pd.read_csv("state_similarities.csv")
score_matrix = score_data.to_numpy()

