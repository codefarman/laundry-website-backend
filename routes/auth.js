import express from 'express';
import passport from 'passport';
import { signup, login, socialLoginCallback } from '../controllers/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), socialLoginCallback);

// Facebook OAuth (uncommented)
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), socialLoginCallback);

// Apple OAuth (removed)
// router.get('/apple', passport.authenticate('apple'));
// router.post('/apple/callback', passport.authenticate('apple', { session: false }), socialLoginCallback);

export default router;