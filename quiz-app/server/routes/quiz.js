
// const express = require('express');
// const QuizResult = require('../models/QuizResult');
// const auth = require('../middleware/auth');  // Import authentication middleware

// const router = express.Router();

// // Save quiz result - protected route
// router.post('/save', auth, async (req, res) => {
//     const { score, totalQuestions } = req.body;

//     console.log('Received quiz save request');  // Log to confirm the request is hitting the server
//     console.log('Score received:', score);  // Log score received
//     console.log('Total Questions received:', totalQuestions);  // Log total questions received
//     console.log('User ID:', req.user.id);  // Log user ID from the token

//     try {
//         const quizResult = new QuizResult({
//             userId: req.user.id,  // Get the logged-in user’s ID from the auth middleware
//             score,
//             totalQuestions,
//         });

//         await quizResult.save();
//         console.log('Quiz result saved successfully!');  // Log success message

//         res.status(201).json({ message: 'Quiz result saved successfully' });
//     } catch (error) {
//         console.error('Error saving quiz result:', error.message);  // Log error details
//         res.status(500).json({ message: 'Error saving quiz result' });
//     }
// });

// module.exports = router;






const express = require('express');
const QuizResult = require('../models/QuizResult');
const auth = require('../middleware/auth');  // Import authentication middleware

const router = express.Router();

// Save quiz result - protected route
router.post('/save', auth, async (req, res) => {
    const { score, totalQuestions } = req.body;

    console.log('Received quiz save request');
    console.log('Score received:', score);
    console.log('Total Questions received:', totalQuestions);
    console.log('User ID:', req.user.id);

    try {
        // Save the quiz result in the database
        const quizResult = new QuizResult({
            userId: req.user.id,  // Get the logged-in user’s ID from the auth middleware
            score,
            totalQuestions,
        });

        await quizResult.save();

        // Determine feedback based on the score
        let feedbackMessage = '';
        if (score < 4) {
            feedbackMessage = 'Try next time';  // For scores less than 4
        } else if (score >= 4 && score < 5) {
            feedbackMessage = 'Good effort';  // For scores between 4 and 5
        } else if (score >= 5 && score < 8) {
            feedbackMessage = 'Good';  // For scores 5 to 7
        } else if (score >= 8) {
            feedbackMessage = 'Excellent work!';  // For scores 8 and above
        }

        console.log('Quiz result saved successfully!');
        res.status(201).json({ message: 'Quiz result saved successfully', feedback: feedbackMessage });
    } catch (error) {
        console.error('Error saving quiz result:', error.message);
        res.status(500).json({ message: 'Error saving quiz result' });
    }
});



module.exports = router;

