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

router.post('/guest', (req, res, next) => {

    req.body = {};
    req.body.email = crypto.randomUUID();
    req.body.name = 'guest';
    req.body.password = '123';
    next();
}, controller.handleNewUser)


export default router;
