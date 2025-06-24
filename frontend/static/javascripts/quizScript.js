let questionCount = 0;

function addQuestion() {
  const container = document.getElementById("questions-container");

  const questionBlock = document.createElement("div");
  questionBlock.classList.add("question-block");
  questionBlock.innerHTML = `
    <label>Question ${questionCount + 1}:</label>
    <input type="text" name="questions[${questionCount}][text]" required>

    <label>Select Type:</label>
    <select name="questions[${questionCount}][type]" onchange="handleTypeChange(this, ${questionCount})">
      <option value="mcq">Multiple Choice</option>
      <option value="truefalse">True/ False</option>
      <option value="shortanswer">Short Answer</option>
    </select>

    <div class="options" id="options-${questionCount}">
      ${generateMCQOptions(questionCount)}
    </div>

    <div class="delete-button">
        <button type="button" onclick="deleteQuestion(this)">Delete Question</button>
    </div>
  `;
  
  container.appendChild(questionBlock);
  questionCount++;
}

function deleteQuestion(button) {
  const questionDiv = button.closest(".question-block");
  questionDiv.remove();
  reindexQuestions();
}

function reindexQuestions() {
  const questionBlocks = document.querySelectorAll(".question-block");
  questionCount = questionBlocks.length;

  questionBlocks.forEach((block, i) => {
    block.dataset.index = i;

    // Update label
    block.querySelector("label").textContent = `Question ${i + 1}:`;

    // Update all inputs, selects, dividers (div) inside the block
    block.querySelectorAll("input, select, div").forEach(labeler => {
      if (labeler.name) {
        labeler.name = labeler.name.replace(/questions\[\d+]/g, `questions[${i}]`);
      }
      if (labeler.id && labeler.id.startsWith("options-")) {
        labeler.id = `options-${i}`;
      }
    });

    // Updates select's onchange event
    const select = block.querySelector(`select[name="questions[${i}][type]"]`);
    if (select) {
      select.setAttribute("onchange", `handleTypeChange(this, ${i})`);
      handleTypeChange(select, i); // Re-rendering options to match updated index
    }
  });

}

function showSaveAlert() {
  return confirm("Are you sure you want to save this quiz?");
}

function handleTypeChange(select, index) {
  const selectedType = select.value;
  const optionsDiv = document.getElementById(`options-${index}`);

    if (selectedType === "mcq") {
        optionsDiv.innerHTML = generateMCQOptions(index);
    } 
    else if (selectedType === "truefalse") {
        optionsDiv.innerHTML = `
        <label>Answer:</label>
        <select name="questions[${index}][answer]">
            <option value="true">True</option>
            <option value="false">False</option>
        </select>
        `;
    } 
    else if (selectedType === "shortanswer") {
    optionsDiv.innerHTML = `
        <label>Upload Image (Optional):</label>
        <input type="file" name="questions[${index}][image]" accept="image/*">
        <label>Answer:</label>
        <input type="text" name="questions[${index}][answer]">
    `; 
    }
}


function generateMCQOptions(index) {
  return `
    <label>Upload Image (Optional):</label>
    <input type="file" name="questions[${index}][image]" accept="image/*">

    <label>Option A:</label><input type="text" name="questions[${index}][options][]" required>
    <label>Option B:</label><input type="text" name="questions[${index}][options][]" required>
    <label>Option C:</label><input type="text" name="questions[${index}][options][]" required>
    <label>Option D:</label><input type="text" name="questions[${index}][options][]" required>

    <label>Correct Option (A/B/C/D):</label>
    <input type="text" name="questions[${index}][answer]" required>
  `;
}
