from flask import Blueprint, render_template, request, redirect, session, current_app
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
from database import db
import os

quiz_design = Blueprint("quiz", __name__)

# 'quizzes' is a collection under the quiztrek database
quizzes = db.quizzes

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    if '.' not in filename:
        return False

    extension = filename.rsplit('.', 1)[1].lower()
    return extension in ALLOWED_EXTENSIONS

@quiz_design.route("/create-quiz", methods=["GET"])
def create_quiz_page():
    if "user" not in session:
        return redirect("/login")
    return render_template("create-quiz.html")


@quiz_design.route("/quiz/create", methods=["POST"])
def handle_create_quiz():
    if "user" not in session:
        return redirect("/login")

    questions = []
    i = 0 # keeps track of question numbering

    while f"questions[{i}][text]" in request.form:
        # handles image file
        image_file = request.files.get(f"questions[{i}][image]")
        image_filename = None

        if image_file and allowed_file(image_file.filename):
            filename = secure_filename(image_file.filename)
            image_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            image_filename = f"uploads/{filename}"  # storing relative path

        question_type = request.form.get(f"questions[{i}][type]")
        options = request.form.getlist(f"questions[{i}][options][]")
        answer_raw = request.form.get(f"questions[{i}][answer]")

        answer = answer_raw

        # if MCQ, convert A/B/C/D to actual option
        if question_type == "mcq":
            letter_to_index = {"A": 0, "B": 1, "C": 2, "D": 3}
            if answer_raw and answer_raw.upper() in letter_to_index:
                index = letter_to_index[answer_raw.upper()]
                if index < len(options):
                    answer = options[index]
                else:
                    answer = ""  # index out of bounds
            else:
                answer = ""  # invalid letter
        
        # questions saved in a dictionary for quizzes container
        question = {
            "text": request.form.get(f"questions[{i}][text]"),
            "type": question_type,
            "answer": answer,
            "options": options,
            "image": image_filename
        }

        questions.append(question)
        i += 1

    # dictionary for quizzes container
    quiz = {
        "title": request.form.get("title"),
        "questions": questions,
        "add_whiteboard": request.form.get("add_whiteboard") == "true",
        "created_by": session["user"]
    }

    quizzes.insert_one(quiz)

    return redirect("/home")

@quiz_design.route("/edit-quiz/<quiz_id>", methods=["GET", "POST"])
# loads quiz, allows form editing, then updates to the database
def handle_edit_quiz(quiz_id):
    if "user" not in session:
        return redirect("/login")

    quiz = quizzes.find_one({"_id": ObjectId(quiz_id), "created_by": session["user"]})

    if not quiz:
        return "Quiz not found or you do not have permission to edit it.", 404 # display error 404 page with the following message

    if request.method == "POST":
        # updates quiz logic
        updated_questions = []
        i = 0 # keeps track of question numbering

        while f"questions[{i}][text]" in request.form:
            image_file = request.files.get(f"questions[{i}][image]")
            image_filename = quiz["questions"][i].get("image") if i < len(quiz["questions"]) else None

            if image_file and allowed_file(image_file.filename):
                filename = secure_filename(image_file.filename)
                image_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
                image_filename = f"uploads/{filename}"

            question_type = request.form.get(f"questions[{i}][type]")
            options = request.form.getlist(f"questions[{i}][options][]")
            answer_raw = request.form.get(f"questions[{i}][answer]")

            answer = answer_raw
            
            if question_type == "mcq":
                letter_to_index = {"A": 0, "B": 1, "C": 2, "D": 3}
                if answer_raw and answer_raw.upper() in letter_to_index:
                    index = letter_to_index[answer_raw.upper()]
                    answer = options[index] if index < len(options) else ""
                else:
                    answer = ""
            
            # dictionary for updated quiz questions
            updated_questions.append({
                "text": request.form.get(f"questions[{i}][text]"),
                "type": question_type,
                "options": options,
                "answer": answer,
                "image": image_filename
            })

            i += 1

        # updates in the quizzes container in the database
        quizzes.update_one(
            {"_id": ObjectId(quiz_id)},
            {
                "$set": {
                    "title": request.form.get("title"),
                    "questions": updated_questions,
                    "add_whiteboard": request.form.get("add_whiteboard") == "true"
                }
            }
        )

        return redirect("/profile")

    return render_template("edit-quiz.html", quiz=quiz)

@quiz_design.route("/delete-quiz/<quiz_id>")
def delete_quiz(quiz_id):
    quizzes.delete_one({"_id": ObjectId(quiz_id)})
    return redirect("/profile")