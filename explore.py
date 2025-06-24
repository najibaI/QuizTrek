# Important imports
from flask import Blueprint, render_template, jsonify
from bson.objectid import ObjectId
from database import db

# 'quizzes' is a collection under the quiztrek database
quizzes_collection = db.quizzes

explore_design = Blueprint("explore", __name__)

@explore_design.route("/explore")
def explore_page():
    return render_template("explore-quiz.html")

@explore_design.route("/api/quizzes")
def get_quizzes():
    all_quizzes = quizzes_collection.find({}, {"title": 1, "created_by": 1})
    quizzes = []
    for quiz in all_quizzes:
        quizzes.append({
            "_id": str(quiz["_id"]),
            "title": quiz.get("title", "Untitled"),
            "created_by": quiz.get("created_by", "Unknown")
        })
    return jsonify(quizzes)