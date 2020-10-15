"""Main Flask module for serving application.
"""
import sys
import flask
import json
from os import listdir

from flask import Flask, render_template, url_for, request

app = Flask(__name__)
app.config["SECRET_KEY"] = "593dc3612430f9a1c1aa214821623db2"
app.config["TEMPLATES_AUTO_RELOAD"] = True

@app.route("/", methods=["GET", "POST"])
@app.route("/index.html", methods=["GET", "POST"])
def home_page():
    return render_template('index.html')


@app.route("/about", methods=["GET", "POST"])
@app.route("/about.html", methods=["GET", "POST"])
def about_page():
    return render_template('about.html')

@app.route("/methodology", methods=["GET", "POST"])
@app.route("/methodology.html", methods=["GET", "POST"])
def methodology_page():
    return render_template('methodology.html')

@app.route('/get_simulations', methods=['POST'])
def get_simulations():
    return request.form['data']


@app.route('/load_data', methods=['GET'])
@app.route('/load_data.js', methods=['GET'])
def load_data():
    files = listdir("results")
    contents = {}

    for file in files:
        with open("results/" + file, "+r") as f:
            contents[file.split(".")[0]] = json.load(f)
    
    state_svg_files = listdir("static/media/state_svgs")

    state_svgs = {}
    for file in state_svg_files:
        if file[-3:] == "bmp":
            continue
        with open("static/media/state_svgs/" + file, "r") as f:
            state_svgs[file.split(".")[0]] = f.read()
    return json.dumps([contents, state_svgs])

if __name__ == '__main__':
    app.run(host="127.0.0.1", port="8080", debug=True)
