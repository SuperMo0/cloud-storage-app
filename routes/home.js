import { Router } from "express";
import * as controller from './../controllers/home.js'

// import express from "express";
// import passport from "./../lib/passport.js";

const router = Router();
router.use(controller.handleAuthorization);

router.get('/', controller.renderHome);




export default router