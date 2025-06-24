document.addEventListener("DOMContentLoaded", () => {
    let allQuizzes = [];

    fetch("/api/quizzes")
        .then((res) => res.json())
        .then((quizzes) => {
        allQuizzes = quizzes;
        renderQuizzes(allQuizzes);
        })
        .catch((err) => {
        console.error("Error loading quizzes:", err);  // displays on the terminal output
        });

    const searchInput = document.getElementById("quiz-search");
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filteredQuizzes = allQuizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(query)
        );
        renderQuizzes(filteredQuizzes);
    });

    function renderQuizzes(quizzes) {
        const tbody = document.querySelector("#quizzes-table tbody");
        tbody.innerHTML = ""; // clears existing rows

        quizzes.forEach((quiz) => {
        const tr = document.createElement("tr");

        // 'Quiz Name' column
        const titleTd = document.createElement("td");
        titleTd.textContent = quiz.title;
        tr.appendChild(titleTd);

        // 'Created By' column
        const createdByTd = document.createElement("td");
        createdByTd.textContent = quiz.created_by;
        tr.appendChild(createdByTd);

        // 'Play Button' column
        const playTd = document.createElement("td");
        const playBtn = document.createElement("button");
        playBtn.textContent = "Play";
        playBtn.addEventListener("click", () => {
            window.location.href = `/quiz/play/${quiz._id}`;
        });
        playTd.appendChild(playBtn);
        tr.appendChild(playTd);

        tbody.appendChild(tr);
        });
    }
});