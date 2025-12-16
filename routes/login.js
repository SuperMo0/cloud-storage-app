import { Router } from "express";
import * as controller from './../controllers/login.js'
import express from "express";
import passport from "./../lib/passport.js";


const router = Router();


router.get('/', controller.renderLogin);

router.post('/', express.urlencoded({ extended: false }), passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }), controller.redirectHome);

router.delete('/', controller.logout);


export default router