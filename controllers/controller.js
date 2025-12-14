
import prisma from "../db/queries.js";
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import queries from "../db/queries.js";
import { name } from "ejs";
import upload from "../lib/upload.js";



function renderSignup(req, res) {
    res.render('signup');
}

function renderLogin(req, res) {
    res.render('login');
}

async function renderHome(req, res) {
    if (!req.user) res.redirect('/login');
    const content = await queries.getUserFilesById(req.user.id, null);
    // console.log(content);
    res.render('home', { content: content, parent: null });
}

async function handleNewUser(req, res) {
    let data = req.body;
    let validationResults = validationResult(req);
    if (!validationResults.isEmpty()) { res.render('signup', { errors: validationResults.array }); return };
    let user = req.body;
    user.password = bcrypt.hashSync(user.password, 10);
    try {
        await queries.insertUser(user);
        user = await queries.getUserByEmail(user.email);
        req.login(user, (e) => {
            if (e) throw e;
            res.redirect('/');
        });

    } catch (error) {
        res.render('signup', { errors: error });
    }
}


async function handleNewFolder(req, res) {
    let path = req.url.split('/');
    let parent = path[path.length - 1];
    let folder_name = req.body.folder_name;

    if (!parent.trim()) parent = null;

    // console.log(req.user);

    await queries.insertFile({
        name: folder_name,
        type: 'folder',
        parent_id: parent,
        user_id: req.user.id,
        owner: req.user
    })
    res.redirect('/');
}


async function handleViewFolder(req, res) {
    if (!req.user) { res.redirect('login'); return };
    let folder_id = req.params.id;
    let content = await queries.getUserFilesById(req.user.id, folder_id);
    let folder = await queries.getFileById(folder_id, req.user.id);
    let parent = folder.parent_id;

    // console.log(parent, "************");
    res.render('home', { content, parent });
}


export default { renderHome, renderLogin, renderSignup, handleNewUser, handleNewFolder, handleViewFolder };