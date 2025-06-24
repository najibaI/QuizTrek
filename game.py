# Important imports
from flask import Blueprint, render_template, jsonify, redirect, url_for
from bson import ObjectId
from database import db

game_design = Blueprint('game', __name__)

@game_design.route('/quiz/play/<quiz_id>')
def play_quiz(quiz_id):
    return render_template("game.html", quiz_id=quiz_id)

@game_design.route('/api/quiz/<quiz_id>')
def get_quiz_data(quiz_id):
    try:
        quiz = db.quizzes.find_one({"_id": ObjectId(quiz_id)})
        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404

        quiz["_id"] = str(quiz["_id"])
        return jsonify({
            "title": quiz["title"],
            "questions": quiz["questions"],
            "add_whiteboard": quiz.get("add_whiteboard", False)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@game_design.route("/exit-quiz")
def exit_quiz():
    return redirect(url_for("explore.explore_page"))