import queries from "../db/queries.js";
import supbase from '../lib/supbase.js'


export function handleAuthorization(req, res) {
    if (!req.user) return res.redirect('/login');
    next();
}

export async function renderHome(req, res) {

    try {
        const folders = await queries.getAllUserFolders();

        const files = await queries.getAllUserFiles();

        res.render('home', { folders, files });
    } catch (error) {

        next(error);
    }

}



/*export async function handleNewFolder(req, res) {
    let path = req.url.split('/');
    let parent = path[path.length - 1];
    let folder_name = req.body.folder_name;

    if (!parent.trim()) parent = null;


    console.log(folder_name);

    await queries.insertFile({
        name: folder_name,
        type: 'folder',
        parent_id: parent,
        user_id: req.user.id,
        owner: req.user
    })
    res.redirect(req.originalUrl);
}


export async function handleViewFolder(req, res) {
    let folder_id = req.params.id;
    let content = await queries.getUserFilesById(req.user.id, folder_id);
    let folder = await queries.getFileById(folder_id, req.user.id);
    let parent = folder.parent_id;
    res.render('home', { content, parent });
}






export async function handleUploadFile(req, res) {

    let path = req.body.path.split('/');
    let parent = path[path.length - 1];

    if (!parent.trim()) parent = null;

    try {
        let url = await supbase.uploadSingleFile(req.file);
        let file = {};
        file.name = req.file.originalname;
        file.size = req.file.size;
        file.link = url;
        file.extension = req.file.mimetype;
        file.user_id = req.user.id
        file.parent_id = parent;
        file.type = 'file';
        await queries.insertFile(file)
        res.send('ok');
    }
    catch (e) {
        res.send('error uploading file');
        return;
    }
}*/