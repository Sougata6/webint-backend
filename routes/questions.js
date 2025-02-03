import express from 'express';
import authM from '../middlewares/auth.js';
import QuestionController from '../controllers/questions.js';
import multer from 'multer';

const router = express.Router();
const questionController = new QuestionController();

router.post('/add-bulk', [authM.verifyAccessToken, multer().single('file')], (req, res) => {
    questionController.addQuestionsInBulk(req, res);
});

router.get('/by-category', [authM.verifyAccessToken], (req, res) => {
    questionController.getQuestionsByCategory(req, res);
});

router.get('/categories', [authM.verifyAccessToken],  (req, res) => {
    questionController.getCategories(req, res);
})

export { router as questionRoutes };