import { Router } from "express";
import * as controller from './../controllers/home.js'
import multer from 'multer';
import express from "express";

let upload = multer();

const router = Router();

router.use(controller.handleAuthorization);

router.get('/', controller.renderHome);


router.get('/shared', controller.renderShared);

router.get('/file/:id', controller.handleRequestFile);

router.post('/folder', express.urlencoded({ extended: false }), controller.handleNewFolder);

router.post('/file', upload.single('file'), controller.handleNewFile);

router.post('/share', express.urlencoded({ extended: false }), controller.handleNewShare);


router.delete('/', express.urlencoded({ extended: false }), controller.handleDelete);


export default router