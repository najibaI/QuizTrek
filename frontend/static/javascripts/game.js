document.addEventListener("DOMContentLoaded", () => {
    const quizId = window.location.pathname.split("/").pop();
    const quizTitle = document.getElementById("quiz-title");
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options-container");
    const nextButton = document.getElementById("next-button");
    const scoreDisplay = document.getElementById("score-display");
    const whiteboardContainer = document.getElementById("whiteboard-container");
    const whiteboardCanvas = document.getElementById("whiteboard");
    const clearButton = document.getElementById("clear-whiteboard");

    let currentQuestionIndex = 0;
    let score = 0;
    let questions = [];

    fetch(`/api/quiz/${quizId}`)
        .then(res => res.json())
        .then(data => {
            quizTitle.textContent = data.title;
            questions = data.questions;

            let addWhiteboard = false;
            if (typeof data.add_whiteboard !== 'undefined' && data.add_whiteboard) {
                addWhiteboard = data.add_whiteboard;
            } else {
                addWhiteboard = false;
            }

            // shows whiteboard if enabled
            if (data.add_whiteboard) {
                document.getElementById('whiteboard-wrapper').style.display = 'block';
                digitalWhiteboard();
            }

            showQuestion();
        })
        .catch(err => console.error("Failed to load quiz:", err));

    // --- Quiz functions ---

    function showQuestion() {
        const current = questions[currentQuestionIndex];
        questionText.innerHTML = "";
        optionsContainer.innerHTML = "";

        // shows text and optional image
        const text = document.createElement("p");
        text.textContent = current.text;
        questionText.appendChild(text);

        if (current.image) {
            const img = document.createElement("img");
            img.src = `/static/${current.image}`;
            img.alt = "Question Image";
            img.style.maxWidth = "100%";
            img.style.marginTop = "1rem";
            questionText.appendChild(img);
        }

        // displays and renders the questions based on type
        if (current.type === "mcq") {
            current.options.forEach(opt => {
                const btn = document.createElement("button");
                btn.textContent = opt;
                btn.classList.add("option-btn");
                btn.addEventListener("click", () => handleAnswer(opt, current.answer));
                optionsContainer.appendChild(btn);
            });
        }

        else if (current.type === "truefalse") {
            const trueBtn = document.createElement("button");
            trueBtn.textContent = "True";
            trueBtn.classList.add("option-btn");
            trueBtn.addEventListener("click", () => handleAnswer("true", current.answer.toLowerCase()));
            optionsContainer.appendChild(trueBtn);

            const falseBtn = document.createElement("button");
            falseBtn.textContent = "False";
            falseBtn.classList.add("option-btn");
            falseBtn.addEventListener("click", () => handleAnswer("false", current.answer.toLowerCase()));
            optionsContainer.appendChild(falseBtn);
        }

        else if (current.type === "shortanswer") {
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Type your answer here";
            input.classList.add("short-answer-input");
            optionsContainer.appendChild(input);

            const submitBtn = document.createElement("button");
            submitBtn.textContent = "Submit";
            submitBtn.classList.add("submit-btn");
            submitBtn.addEventListener("click", () => {
                const userInput = input.value.trim();
                handleAnswer(userInput, current.answer);
                // preventing empty submissions
                if (userInput === "") return;

            });
            optionsContainer.appendChild(submitBtn);
        }
    }

    function handleAnswer(selected, correct) {
        let isCorrect = false;
        const current = questions[currentQuestionIndex];

        if (typeof correct === "string") {
            isCorrect = selected.trim().toLowerCase() === correct.trim().toLowerCase();
        }

        if (isCorrect) score++

        // displays the correct answer for the short answer question
        if (current.type == "shortanswer") {
            document.querySelectorAll(".submit-btn").forEach(btn => btn.disabled = true);
            document.querySelectorAll(".short-answer-input").forEach(input => input.disabled = true);

            if (!isCorrect) {
                const answerFeedback = document.createElement("p");
                answerFeedback.classList.add("answer-feedback");
                answerFeedback.innerHTML = `Correct answer: <strong>${correct}</strong>`;
                optionsContainer.appendChild(answerFeedback);
            }
        }

        // disable buttons or input
        document.querySelectorAll(".option-btn").forEach(btn => {
            btn.disabled = true;
            if (btn.textContent.trim().toLowerCase() === correct.trim().toLowerCase()) {
                btn.classList.add("correct");
            } else if (btn.textContent.trim().toLowerCase() === selected.trim().toLowerCase()) {
                btn.classList.add("wrong");
            }
        });

        nextButton.style.display = "inline-block";
    }

    nextButton.addEventListener("click", () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
            nextButton.style.display = "none";
            clearWhiteboard(); // clear whiteboard on next question
        } else {
            showFinalScore();
            whiteboardContainer.style.display = "none"; // hide whiteboard at end
        }
    });

    function showFinalScore() {
        questionText.textContent = "Congratulations! You completed the quiz!";
        optionsContainer.innerHTML = "";
        scoreDisplay.textContent = `You scored ${score} out of ${questions.length}`;
        nextButton.style.display = "none";
    }

    // --- Digital whiteboard functions ---

    let context, drawing = false, lastX = 0, lastY = 0;
    let currentColor = "#11162c";  // initial colour -- ensured it was matching in the styleGame.css and game.html
    let currentThickness = 2;
    let eraserOn = false;

    function digitalWhiteboard() {
        context = whiteboardCanvas.getContext('2d');
        context.strokeStyle = currentColor;
        context.lineWidth = currentThickness;
        context.lineJoin = "round";
        context.lineCap = "round";

        whiteboardCanvas.addEventListener("mousedown", startDrawing);
        whiteboardCanvas.addEventListener("mousemove", draw);
        whiteboardCanvas.addEventListener("mouseup", stopDrawing);
        whiteboardCanvas.addEventListener("mouseout", stopDrawing);

        // tool controls
        const colorPicker = document.getElementById("color-picker");
        const thicknessSlider = document.getElementById("thickness-slider");
        const eraserToggle = document.getElementById("eraser-toggle");
        const clearBtn = document.getElementById("clear-whiteboard");

        colorPicker.addEventListener('input', (e) => {
            currentColor = e.target.value;
            if (!eraserOn) {
                context.strokeStyle = currentColor;
            }
        });

        thicknessSlider.addEventListener("input", (e) => {
            currentThickness = e.target.value;
            context.lineWidth = currentThickness;
        });

        eraserToggle.addEventListener("click", () => {
            eraserOn = !eraserOn;
            if (eraserOn) {
                context.strokeStyle = "white"; // erase with white color
                eraserToggle.classList.add("active");
                eraserToggle.textContent = "Eraser On";
            } else {
                context.strokeStyle = currentColor;
                eraserToggle.classList.remove("active");
                eraserToggle.textContent = "Eraser Off";
            }
        });

        clearBtn.addEventListener("click", clearWhiteboard);
    }

    function startDrawing(e) {
        drawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!drawing) return;
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(e.offsetX, e.offsetY);
        context.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        drawing = false;
    }

    function clearWhiteboard() {
        if (!context) return;
        context.clearRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
    }
});