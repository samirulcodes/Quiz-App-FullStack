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


// Explanation

// How does the application handle user authentication?
// Answer: The application uses JWT (JSON Web Token) for user authentication. When a user logs in, a token is stored in localStorage. This token is sent in the Authorization header for authenticated API requests (e.g., saving quiz results). The token is also used to identify the logged-in user.

// How are quiz questions fetched and displayed?
// Answer: Quiz questions are fetched from the Open Trivia Database API (https://opentdb.com/api.php?amount=10&type=multiple). The questions and options are displayed dynamically by iterating through the fetched data and creating DOM elements for each question and its options.

// How does the timer work in the quiz application?
// Answer: The timer is implemented using setInterval. It counts down from 20 minutes (1200 seconds), updating the DOM every second to show the remaining time. When the timer reaches 0, the quiz ends automatically.

// How are quiz results saved to the backend?
// Answer: After the quiz ends, the score is sent to the server via a POST request to the /api/quiz/save endpoint. The request includes the user's token in the Authorization header for authentication and the score as part of the JSON body.

// What happens when the timer expires or all questions are answered?
// Answer: When the timer expires or all questions are answered, the endQuiz() function is called. This stops the timer, hides the quiz container, displays the score, and sends the results to the server for storage.

// How does the application handle dynamic question and answer rendering?
// Answer: Questions and their options are dynamically rendered using JavaScript. The displayQuestion function updates the DOM with the current question, shuffles the options, and adds event listeners to each option to handle user selection.

// How does the application ensure secure API communication?
// Answer: The application includes the user's token in the Authorization header for protected routes, ensuring that only authenticated users can access sensitive operations like saving quiz results.

// How is the feedback from the server handled after saving quiz results?
// Answer: The server's response includes feedback, which is displayed in a designated quiz-feedback div. This provides the user with immediate feedback on their quiz performance.

// What role does localStorage play in this application?
// Answer: localStorage is used to store the user's authentication token, enabling the application to maintain the user's session across page reloads. It is also checked before saving quiz results to ensure the user is logged in.

// What happens during the logout process?
// Answer: During logout, the token is removed from localStorage, and the user is redirected to the login page. This ensures that no sensitive data remains accessible after logout.

// What considerations are made for user experience after registration?
// Answer: After registration, the loginAfterRegister function prompts an automatic login attempt using the entered credentials, reducing friction in transitioning from registration to quiz-taking.

// How does the application handle invalid login attempts?
// Answer: If the server response during login does not include a token, an alert displays the error message, ensuring the user understands why login failed.

// How are correct answers tracked during the quiz?
// Answer: Each option button includes an event listener that checks if the selected option matches the correct answer. If correct, the score is incremented, and the quiz progresses to the next question.


// TELL TO INTERVIEWR ONLY FRONTEND PART IS DONE BY ME