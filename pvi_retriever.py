import requests
import sys
import numpy as np
import pandas as pd
from bs4 import BeautifulSoup

def pvi_retriever(path=None):
    """
    Calculates the state pvi based on the 2012, 2016 
    presidential elections. 
    Args:
        path - Writes csv file to path, otherwise returns
        series.
    """
    score_data = pd.read_csv("data/state_similarities.csv", index_col="Geography")
    years = ["2012", "2016"]
    dems = ["Barack Obama", "Hillary Clinton"]
    average_pvi = np.zeros(50)
    states = []
    for num in range(2):
        things = []
        for x in score_data.columns:
            if "-" in x:
                continue
            if num == 0:
                states.append(x)
        # x = "Arizona"
            if x.lower() == "national":
                l = 'https://en.wikipedia.org/wiki/' + years[num] + '_United_States_presidential_election'
            else:
                l = 'https://en.wikipedia.org/wiki/' + years[num] + '_United_States_presidential_election_in_' + x.replace(" ","_")
            seen_already = False
            dem_lead = False
            percentage_num = 0
            no = BeautifulSoup(requests.get(l).content).body.find(id="content").find(id="bodyContent").find(id="mw-content-text").div.table
            for thing in no.tbody.tr.next_siblings:
                try:
                    for y in thing.td.table.tbody.find_all("tr"):
                        for th1 in y.find_all('td'):
                            if seen_already == False:
                                try:
                                    if th1.b.a.text.strip() ==  dems[num]:
                                        dem_lead = True
                                        seen_already = True
                                except:
                                    pass
                            if percentage_num < 2:
                                try:
                                    if th1.text.strip()[-1] ==  "%":
                                        try:
                                            x = float(th1.text.strip()[:-1])
                                            if dem_lead == False:
                                                x = -x
                                            percentage_num += 1
                                            things.append(x)
                                        except:
                                            pass
                                except:
                                    pass
                except: 
                    pass
        things = np.array(things)
        margins = things[::2]-things[1::2]
        pvi = margins[1:]-margins[0]
        average_pvi += pvi
    average_pvi = average_pvi/2
    np.insert(average_pvi, 0, "National")
    states.remove("District of Columbia")
    pvi = pd.Series(average_pvi, name="pvi")
    if path:
        with open("state_pvi.csv", "w") as f:
                pvi.index = states
                pvi.index.name = "territories"
                f.write(pvi.round(2).to_csv())
    return pvi

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pvi_retriever(sys.argv[1])
    else:
        pvi = pvi_retriever(sys.argv[1])
        print(pvi)