import express from "express";
import AuthController from '../controllers/auth.js';

const router = express.Router();
const authController = new AuthController();

router.post('/register', [], (req, res) => {
    authController.register(req, res);
});

router.post('/login', [], (req, res) => { 
    authController.loginUsingPassword(req, res);
});

router.post('/reset/password', [], (req, res) => {
    authController.resetPassword(req, res);
});

export { router as authRoutes };