# Important imports
from flask import Flask, render_template, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
from quiz import quiz_design
from explore import explore_design
from game import game_design
from userProfile import user_profile_design
import os

# easy access to folders for the html pages -- also makes it easier to render pages with Flask as a backend
app = Flask(__name__, template_folder="frontend/pages", static_folder="frontend/static")

# configuration setting in Flask to secure sessions and manage cookies
app.secret_key = os.urandom(24) # generates 24 bytes of secure random data (cryptographically)

app.config['UPLOAD_FOLDER'] = 'frontend/static/uploads'

# users is a collection under the quiztrek database
users = db.users


@app.route("/")
def index():
    return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        user = users.find_one({"email": email})
        if user and check_password_hash(user["password"], password):
            session["user"] = email
            return redirect(url_for("home"))
        else:
            return render_template("login.html", error="Invalid login credentials.")
    return render_template("login.html")

@app.route("/home")
def home():
    if "user" in session:
        return render_template("home.html")
    return redirect(url_for("login"))

@app.route("/logout")
def logout():
    session.clear() # clears all session data
    return redirect(url_for("login"))

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        password = request.form["password"]
        confirm = request.form["confirm_password"]

        if password != confirm:
            return render_template("register.html", error="Password does not match!")

        if users.find_one({"email": email}):
            return render_template("register.html", error="Email already registered.")

        hashed_pass = generate_password_hash(password)

        # dictionary for users container
        users.insert_one({
            "name": name,
            "email": email,
            "password": hashed_pass
        })

        return redirect(url_for("login"))

    return render_template("register.html")

# takes and renders the backend functions from the following pages
app.register_blueprint(quiz_design)

app.register_blueprint(explore_design)

app.register_blueprint(game_design)

app.register_blueprint(user_profile_design)

# runs the the overall platform
if __name__ == "__main__":
    app.run(debug=True)