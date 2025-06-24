# Important imports
from flask import Blueprint, render_template, session, redirect
from database import db

user_profile_design = Blueprint("user_profile", __name__)

# 'users' and 'quizzes' is a collection under the quiztrek database
users = db.users
quizzes = db.quizzes

@user_profile_design.route("/profile")
def profile():
    if "user" not in session:
        return redirect("/login")

    # matching the emails between the 'users' container and 'quizzes' container
    user_email = session["user"]
    user = users.find_one({"email": user_email})
    user_quizzes = quizzes.find({"created_by": user_email})

    return render_template("user-profile.html", user=user, quizzes=user_quizzes)