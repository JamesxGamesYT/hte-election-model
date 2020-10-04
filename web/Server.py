"""Main Flask module for serving application.
"""
import sys
import flask

from flask import Flask, render_template, url_for, request

app = Flask(__name__)
app.config["SECRET_KEY"] = "593dc3612430f9a1c1aa214821623db2"
app.config["TEMPLATES_AUTO_RELOAD"] = True

@app.route("/", methods=["GET", "POST"])
@app.route("/index.html", methods=["GET", "POST"])
def home_page():
    return render_template('index.html')

@app.route('/about.html', methods=["GET", "POST"])
def about_page():
    return render_template("about.html")

@app.route('/get_simulations', methods=['POST'])
def get_simulations():
    return request.form['data']


if __name__ == '__main__':
    app.run(host="127.0.0.1", port="8080", debug=True)
