const registerBtn = document.getElementById('registerBtn');
const loginBtn = document.getElementById('loginBtn');
const startQuizBtn = document.getElementById('startQuizBtn');
const quizContainer = document.getElementById('quiz-container');
const quizDiv = document.getElementById('quiz');
const authDiv = document.getElementById('auth');
const timerDiv = document.getElementById('timer');
const questionDiv = document.getElementById('question');
const optionsDiv = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const resultDiv = document.getElementById('result');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;

// Register
registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    alert(data.message);
    if (data.message === 'User registered') {
        loginAfterRegister();
    }
});

// Automatically prompt login after registration
function loginAfterRegister() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    loginBtn.click();
}

// Login
loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        authDiv.style.display = 'none';
        quizContainer.style.display = 'block'; // Show Start Quiz button after login
    } else {
        alert(data.message);
    }
});

// Start Quiz Button
startQuizBtn.addEventListener('click', async () => {
    startQuizBtn.style.display = 'none'; // Hide Start Quiz button
    quizDiv.style.display = 'block';
    await startQuiz();
});

// Start Quiz function
async function startQuiz() {
    // Fetch 10 questions from Open Trivia Database API
    const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
    const data = await response.json();
    questions = data.results;
    currentQuestionIndex = 0;
    score = 0;
    timerDiv.innerText = 'Time Left: 20:00';
    displayQuestion();
    startTimer(1200); // 20 minutes in seconds
}

const questionNumberDiv = document.getElementById('question-number');

function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        // Display the current question number (e.g., Question 1 of 10)
        questionNumberDiv.innerHTML = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

        const question = questions[currentQuestionIndex];
        questionDiv.innerHTML = question.question;
        optionsDiv.innerHTML = '';

        // Shuffle and display the answers
        const answers = [...question.incorrect_answers, question.correct_answer].sort();
        answers.forEach(option => {
            const button = document.createElement('button');
            button.innerText = option;
            button.addEventListener('click', () => selectOption(option === question.correct_answer));
            optionsDiv.appendChild(button);
        });
    } else {
        endQuiz();
    }
}


// Handle option selection
function selectOption(isCorrect) {
    if (isCorrect) {
        score++;
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < 10) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

// Timer function
function startTimer(seconds) {
    let timeLeft = seconds;
    timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDiv.innerText = `Time Left: ${minutes}:${secs < 10 ? '0' + secs : secs}`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            endQuiz();
        }
    }, 1000);
}


// End the quiz and display the score
async function endQuiz() {
    clearInterval(timer);
    quizDiv.style.display = 'none';
    resultDiv.innerText = `Your score: ${score} out of 10 on ${new Date().toLocaleString()}`;
    resultDiv.style.display = 'block';

    // Save the result to the database
    await saveQuizResult(score);
}


// Function to save quiz result to the server
async function saveQuizResult(score) {
    const token = localStorage.getItem('token');  // Retrieve the user's auth token

    if (!token) {
        alert('User not logged in. Cannot save the result.');
        return;
    }

    try {
        console.log('Saving quiz result with score:', score);

        const response = await fetch('http://localhost:5000/api/quiz/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Send token for authentication
            },
            body: JSON.stringify({ score, totalQuestions: 10 })  // Send score and total questions
        });

        const data = await response.json();

        if (response.status === 201) {
            console.log('Quiz result saved successfully on the server:', data.message);

            // Display feedback based on server response
            const feedbackDiv = document.getElementById('quiz-feedback');
            feedbackDiv.textContent = data.feedback;
            feedbackDiv.style.display = 'block';  // Show the feedback div

            // Show the logout button after quiz completion
            document.getElementById('logout-btn').style.display = 'block';
        } else {
            console.error('Error saving quiz result:', data.message);
        }
    } catch (error) {
        console.error('Network error while saving quiz result:', error);
    }
}

// On page load, ensure the logout button is hidden
window.onload = function() {
    document.getElementById('logout-btn').style.display = 'none';  // Ensure logout button is hidden
};


// Function to handle user logout
function logout() {
    // Clear the token from local storage
    localStorage.removeItem('token');

    // Redirect the user to the login page
    window.location.href = '/login.html';  // Change this path as necessary for your project
}

// Attach the logout function to the button
document.getElementById('logout-btn').addEventListener('click', logout);

