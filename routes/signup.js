import * as controller from './../controllers/signup.js'
import Router from 'express'
import express from 'express'
import * as validate from '../lib/validator.js';


const router = Router();

router.get('/', controller.renderSignup);

router.post('/',
    express.urlencoded({ extended: false }),
    validate.validateNewUser,
    controller.handleNewUser,
);

export default router;
