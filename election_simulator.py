import numpy as np 
import numpy.polynomial.polynomial as poly
import pandas as pd 
import requests
import re
from polling_error import polling_error_coeffs
from bs4 import BeautifulSoup

score_data = pd.read_csv("data/state_similarities.csv")
score_matrix = score_data.to_numpy()

date = np.datetime64('2020-09-14')
election_date = np.datetime64('2020-11-03')
coeffs = polling_error_coeffs()
poll_error = poly.polyval((election_date-date).astype(int), coeffs)
print(poll_error)
