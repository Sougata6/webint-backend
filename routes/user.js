import express from 'express';
import UserController from '../controllers/user.js';
import authM from '../middlewares/auth.js';
import multer from 'multer';

const router = express.Router();
const userController = new UserController();

router.get('/profile', [authM.verifyAccessToken], (req, res) => {
    userController.getUserDetails(req, res);
});

router.patch('/profile', [authM.verifyAccessToken, multer().single('profilePicture')], (req, res) => {
    userController.updateUserDetails(req, res);
});

export { router as userRoutes };