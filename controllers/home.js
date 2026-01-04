import { locales } from "validator/lib/isIBAN.js";
import * as queries from "../db/queries.js";
import supbase from '../lib/supbase.js'
import { time } from './../lib/misc.js'


export function handleAuthorization(req, res, next) {
    if (!req.user) return res.redirect('/login');
    next();
}

export async function renderHome(req, res) {

    let currentLocation = req.query?.location || req.session.rootId;

    if (currentLocation == null) {
        currentLocation = await queries.getRootFolder(req.user.id);
        req.session.rootId = currentLocation;
    }


    try {
        let folders = await queries.getAllUserFolders(req.user.id);
        folders = JSON.stringify(folders);

        let files = await queries.getAllUserFiles(req.user.id);
        files = JSON.stringify(files);

        res.render('home', { folders, files, currentLocation, rootId: req.session.rootId });
    } catch (error) {
        next(error);
    }

}


export async function handleNewShare(req, res) {

    let file_id = req.body.file_id;

    let duration = req.body.duration;

    let file = await queries.getFileById(file_id, req.user.id);


    if (!file) {
        return next('no file exist');
    }

    // let url = await supbase.getFileUrl(file.path, duration * 60 * 60, req.query.download);
    let url = '22';

    let expires_at = new Date();

    expires_at.setTime(expires_at.getTime() + duration * 60 * 60 * 1000);
    expires_at = time.format(expires_at);

    let share = await queries.insertSharedFile({ user_id: req.user.id, file_id, url, expires_at });

    res.json({ url });

}
export async function renderShared(req, res, next) {
    try {
        let files = await queries.getAllSharedUserFiles(req.user.id);
        res.render('shared', { files });
    } catch (error) {
        next(error);
    }
}

export async function handleNewFolder(req, res, next) {

    let folder_name = req.body.name;
    let location = req.body.location;
    try {
        await queries.insertFolder({
            name: folder_name,
            parent_id: location,
            user_id: req.user.id,
        })

    } catch (error) {
        return next(error)
    }

    res.redirect(`/home?location=${location}`);
}

function createFileObject(req, path, location) {

    let file = {};
    file.name = req.file.originalname;
    file.size = req.file.size;
    file.path = path;
    file.type = req.file.mimetype;
    file.user_id = req.user.id
    file.parent_id = location;


    return file;
}

export async function handleNewFile(req, res, next) {

    let location = req.body.location || req.session.rootId;
    try {

        let path = await supbase.uploadSingleFile(req.file);

        let file = createFileObject(req, path, location);

        await queries.insertFile(file);
        res.redirect(`/home?location=${location}`);
    }
    catch (e) {
        next(e);
    }
}


export async function handleRequestFile(req, res, next) {

    let id = req.params.id;
    let file = await queries.getFileById(id, req.user.id);
    if (!file) {
        return next('no file exist');
    }

    let url = await supbase.getFileUrl(file.path, 10, req.query.download);
    res.json({ url });
}


export async function handleDelete(req, res, next) {

    let currentLocation = req.body.location;
    req.session.location = currentLocation;

    let id = req.body.id;
    try {
        let res = await queries.deleteById(id, req.user.id);
        res.redirect('/home');
    }
    catch (e) {
        next(e);
    }
}






