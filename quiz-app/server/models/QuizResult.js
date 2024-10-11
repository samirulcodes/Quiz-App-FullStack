const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
        default: 10,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult;

