import numpy as np 
import numpy.polynomial.polynomial as poly
import pandas as pd 
import requests
from math import exp
from bs4 import BeautifulSoup

from polling_error import polling_error_coeffs
REP = "Trump"
DEM = "Biden"

date = np.datetime64('today')
election_date = np.datetime64('2020-11-03')
coeffs = polling_error_coeffs()
poll_error = poly.polyval((election_date-date).astype(int), coeffs)

def time_weighting(poll_date, cutoff=30):
    """
    Returns how much to weight polls based on 
    how long ago they was added to FiveThirtyEight. Uses a logistic-type
    function. If poll date is past a certain cutoff, automatically sets
    the weight to 0.
    Args:
        date - np.datetime64 object, represents day poll
        was added to FiveThirtyEight polling averages.
    
    Returns:
        float from 0-1 that indicates how much to weight polls on that date.
    """

    x = (date-poll_date).astype(int)
    y = exp(0.15*x)
    y = 1 + 0.4*y
    y = 1.4/y
    return y

score_data = pd.read_csv("data/state_similarities.csv", index_col="Geography")

score_matrix = score_data.to_numpy()
print(score_matrix)
territories = np.asarray(score_data.index)
to_fill = {"margin":np.zeros(len(territories)), "poll_num":np.zeros(len(territories))}
territory_averages = pd.DataFrame(to_fill)
for num, territory in enumerate(territories):
    territory = territory.replace("-","/")
    territory = territory.replace(" ","-")
    print(territory.lower())
    # link = "https://www.realclearpolitics.com/epolls/2020/president/us/general_election_" + REP.lower() + "_vs_" + DEM.lower() + "-6247.html"
    link = "https://projects.fivethirtyeight.com/polls/president-general/" + territory.lower() + "/"
    yes = requests.get(link)
    if yes.status_code == 404:
        territory_averages.iat[num,0] = 999
        territory_averages.iat[num,1] = 0
        continue
    soup = BeautifulSoup(yes.content, features="lxml")
    poll_container = soup.body.find(attrs={"class":"container content"}).find(attrs={"class":"polls"})
    territory_margins = []
    weights = []
    dates = []
    for x in poll_container.children:
        poll_date = np.datetime64(x.h2["data-date"])
        dates.append((date - poll_date).astype(int))
        weight = time_weighting(poll_date)
        day = x.table.tbody
        for poll in day.find_all(attrs={"class":"visible-row"}):
            choices = poll.find_all(attrs={"class":"answers hide-desktop"})[0].div
            choices = [choice.p.text for choice in choices.children]
            if REP not in choices or DEM not in choices:
                continue
            area = poll.find(attrs={"class":"dates hide-desktop"}).span.text.lower()
            if territory.lower() in ["maine", "nebraska"]:
                if area.lower() != territory.lower():
                    continue
            # print(poll.prettify())
            # print(poll.find_all(attrs={"class":"visible-row"}))
            if poll.find_all(attrs={"class":"net hide-mobile even"}) != []:
                poll_margin = 0
            else:
                # print(poll.find_all(attrs={"class":"leader hide-mobile"})[0].text)
                if poll.find_all(attrs={"class":"leader hide-mobile"})[0].text == DEM:
                    poll_margin = int(poll.find_all(attrs={"class":"net hide-mobile dem"})[0].text[1:])
                else:
                    # print(poll.find_all(attrs={"class":"net hide-mobile rep"}))
                    poll_margin = -int(poll.find_all(attrs={"class":"net hide-mobile rep"})[0].text[1:])
            territory_margins.append(weight*poll_margin)
            weights.append(weight)
    try:
        territory_average = sum(territory_margins)/sum(weights)
    except ZeroDivisionError:
        territory_averages.iat[num,0] = 999
        territory_averages.iat[num,1] = 0
        continue
    if territory.lower() == "national":
        national_margin = territory_average
    territory_averages.iat[num,0] = territory_average
    territory_averages.iat[num,1] = len(territory_margins)/max(dates)
territory_averages["percentage"] = territory_averages["poll_num"]/sum(territory_averages["poll_num"])
print(territory_averages)
# national_margin = soup.body.div.find(attrs={"class":"alpha-container"})
# national_margin = national_margin.div.find(id="polling-data-rcp").table
# national_margin = national_margin.find(attrs={"class":"rcpAvg"}).find(attrs={"class":"spread"}).span
# try:
#     if national_margin["class"][0] == "dem":
#         national_margin = national_margin.text
#         national_margin = float(national_margin.replace(DEM, "")[2:])
#     else:
#         national_margin = national_margin.text
#         national_margin = -float(national_margin.replace(REP, "")[2:])
# except AttributeError:
#     national_margin = 0
lean_data = pd.read_csv("data/state_pvi.csv")
lean_data["territories"] = lean_data["territories"].str.lower()
lean_data['pvi'] = lean_data['pvi'].astype(float)
lean_data["predicted_margin"] = lean_data["pvi"]+national_margin
for key, series in territory_averages.iteritems():
    lean_data[key] = series
no_polling_data_mask = lean_data["margin"] == 999
lean_data["dem difference"] = lean_data["margin"]-lean_data["predicted_margin"]
lean_data.drop(["pvi","poll_num"],axis=1,inplace=True)
deviation_vector = lean_data["dem difference"].to_numpy()
weights = lean_data["percentage"].to_numpy()
print(weights/sum(weights))
deviation_vector = deviation_vector * weights/sum(weights)
print(deviation_vector)
for num, weight in enumerate(weights):
    score_matrix[num,num] += weight/0.001
    print(score_data.columns[num], score_matrix[num,num])
# print(score_matrix)
for n,x in enumerate(score_matrix):
    # print(score_data.columns[n])
    sum = 0
    for num,y in enumerate(x):
        # print(score_data.columns[num])
        sum += y * deviation_vector[num]
        # print(sum)
new_deviation_vector = np.dot(score_matrix, deviation_vector)
print(new_deviation_vector)
new_margin = new_deviation_vector.reshape(len(new_deviation_vector)) + lean_data["predicted_margin"]
lean_data["new_margin"] = new_margin
print(lean_data)
print(lean_data.sort_values("new_margin"))
print(lean_data.sort_values("new_margin").reset_index())