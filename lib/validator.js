import { body, validationResult } from 'express-validator'
import queries from '../db/queries.js';


let EmailValidation = body('email')
    .trim()
    .notEmpty()
    .isEmail({ domain_specific_validation: true }).withMessage('not a valid email adress')
    .isLength({ max: 50 }).withMessage('not a valid email adress')
    .custom(async (email, meta) => {
        let exist = await queries.checkIfUserExist(email);
        if (exist) throw new Error('This Email is already in use');
    });

let passwordValidation = body('password')
    .trim()
    .notEmpty().withMessage('Password should not be empty');

let confirmValidation = body('confirm_password')
    .custom((input, meta) => {
        const req = meta.req;
        return req.body.password === input;
    }).withMessage("Passwords don't match");

export const validateNewUser = [EmailValidation,
    passwordValidation,
    confirmValidation
];


export const check = (req) => {

    let validationResults = validationResult(req);

    if (validationResults.isEmpty()) return [];

    return validationResults.array();
}

