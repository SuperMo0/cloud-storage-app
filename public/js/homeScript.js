import { cookie } from "express-validator";


(function handleDropdown() {
    const newFolderDropdown = document.querySelector('.new-folder-dropdown');

    const newFolderForm = document.querySelector('.new-folder-form');

    newFolderDropdown.addEventListener("click", (e) => {
        newFolderForm.classList.toggle('hide');
    })
})();



let folders = [];
let files = [];
let foldersMap = new Map();
let root = 0;
let currentLocation = root;
let pathList = ['My Drive'];

(function populate() {
    let mainContent = document.querySelector('.main-content');

    folders = JSON.parse(mainContent.dataset.folders);

    files = JSON.parse(mainContent.dataset.files);

    currentLocation = mainContent.dataset.currentlocation;
    console.log(currentLocation);


    for (let folder of folders) {
        foldersMap.set(folder.id, { name: folder.name, id: folder.id, parent_id: folder.parent_id, folders: [], files: [] });
    }

    for (let folder of folders) {
        if (folder.parent_id == folder.id) continue;
        foldersMap.get(folder.parent_id).folders.push(folder);
    }

    for (let file of files) {
        foldersMap.get(file.parent_id).files.push(file);
    }

})();



(function buildTree() {

    let builder = function (currentLocation, parent) {

        currentLocation.parent = parent;
        for (let i = 0; i < currentLocation.folders.length; i++) {
            let child = currentLocation.folders[i];
            child = foldersMap.get(child.id);
            currentLocation.folders[i] = builder(child, currentLocation);

        }
        return currentLocation;
    }

    root = builder(foldersMap.get('0'), foldersMap.get('0'));
})();



let filesOperations = (function handleFilesOperations() {

    let imagePreviewContainer = document.querySelector('.image-preview-container');
    let img = document.createElement('img');
    let download = document.querySelector('.download-media');
    img.classList.add('image-preview');
    let video = document.createElement('video');
    video.setAttribute("loop", "true");
    video.classList.add('video-preview');

    let shareButton = document.querySelector('.share-button');
    let shareForm = document.querySelector('.share-file-form');


    shareButton.onclick = (e) => {
        if (!download.file) return;
        shareForm.classList.remove('hide');
    }

    shareForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let data = new FormData(e.target);
        data.append('file_id', download.file.id);
        let res = await fetch('/home/share', { method: "post", body: new URLSearchParams(data) });
        res = await res.json();
        let url = res.url
        navigator.clipboard.writeText(url);
        showNotification('Link is copied to your clipboard');
    })

    function showNotification(message) {
        let notification = document.querySelector('.notification');
        notification.textContent = message;
        notification.classList.add('visable');
        setTimeout(() => {
            notification.classList.remove('visable');
        }, 3000)

    }

    function isMedia(type) {
        if (type.startsWith('image') || type.startsWith('video')) return true;
        return false;
    }

    function isPdf(type) {
        if (type === 'application/json') return true;
        return false;
    }

    function clearPreviews() {
        imagePreviewContainer.replaceChildren();
        shareForm.classList.add('hide');
    }

    function handlePreview(f, url) {
        clearPreviews();
        if (f.type.startsWith('image')) {
            img.src = url;
            imagePreviewContainer.appendChild(img);
        }
        else {
            video.src = url;
            video.play()
            imagePreviewContainer.appendChild(video);
        }

        download.file = f;

    }

    download.onclick = () => {
        handleFileDownload(download.file);
    }

    async function handleFileClick(file) {
        let res = await fetch('/home/file/' + file.id);
        res = await res.json();
        let url = res.url;
        if (isMedia(file.type)) handlePreview(file, url);
        else if (isPdf(file.type)) {

        }
        else {

        }

    }

    async function handleFileDownload(file) {
        if (!file) return;
        let res = await fetch('/home/file/' + file.id + '?download=true');
        res = await res.json();
        let url = res.url;
        let data = await fetch(url);
        data = await data.blob();
        data = URL.createObjectURL(data);

        let a = document.createElement('a');
        a.setAttribute("download", file.name);
        a.href = data;
        a.click();
        URL.revokeObjectURL(data);
    }

    return { handleFileClick, isMedia, isPdf, clearPreviews }

})();



(function handleNavigation() {

    currentLocation = foldersMap.get(currentLocation);
    let crnt = currentLocation;
    while (crnt.id != 0) {
        pathList.push(crnt.name);
        crnt = crnt.parent;
    }
    foldersMap.clear();
    let foldersContainer = document.querySelector('.folders-container');

    let folderTemplate = document.querySelector('.folder-container').cloneNode(true);

    folderTemplate.classList.remove('hide');


    let filesContainer = document.querySelector('.files-container');

    let mediaFileTemplate = document.querySelector('.file-container.media').cloneNode(true);
    mediaFileTemplate.classList.remove('hide');

    let pdfFileTemplate = document.querySelector('.file-container.pdf').cloneNode(true);
    pdfFileTemplate.classList.remove('hide');

    let generalFileTemplate = document.querySelector('.file-container.general').cloneNode(true);
    generalFileTemplate.classList.remove('hide');

    let handleDelete = async function (file_id) {

        let res = await fetch('/home', {
            method: 'delete',
            body: new URLSearchParams({ id: file_id, location: currentLocation.id })
        })
        if (res.ok) location.replace('/home');
        else location.replace('/error');
    }

    let showDirecotory = function (folder) {
        filesContainer.replaceChildren();
        foldersContainer.replaceChildren();

        for (let f of folder.folders) {
            let newFolder = folderTemplate.cloneNode(true);
            newFolder.querySelector('.folder-name').textContent = f.name;
            newFolder.onclick = (e) => {
                if (e.target.classList.contains('delete-button')) return;
                filesOperations.clearPreviews(); pathList.push(f.name); showDirecotory(f); currentLocation = f
            }
            let deleteButton = newFolder.querySelector('.delete-button');
            foldersContainer.appendChild(newFolder);
            deleteButton.onclick = () => { handleDelete(f.id) };
        }

        for (let f of folder.files) {
            let newFile;

            if (filesOperations.isMedia(f.type)) newFile = mediaFileTemplate.cloneNode(true);
            else if (f.type === 'application/pdf') newFile = pdfFileTemplate.cloneNode(true);
            else newFile = generalFileTemplate.cloneNode(true);

            newFile.querySelector('.file-name').textContent = f.name;
            newFile.querySelector('.file-size').textContent = (f.size / 1000000) + "MB";
            newFile.querySelector('.file-creation-time').textContent = f.created_at;
            newFile.onclick = (e) => { if (e.target.classList.contains('delete-button')) return; filesOperations.handleFileClick(f) };

            filesContainer.appendChild(newFile);
        }
        let path = document.querySelector('.path');
        path.textContent = pathList.join(' > ');
    }

    let backButton = document.querySelector('.go-back');
    function navigateBack() {
        if (currentLocation === root) return;
        pathList.pop();
        currentLocation = currentLocation.parent;
        showDirecotory(currentLocation);
    }
    backButton.onclick = navigateBack;


    showDirecotory(currentLocation);
})();


(function handlePostNewFolder() {

    let newFolderForm = document.querySelector('.new-folder-form');
    let location = newFolderForm.querySelector('#location');
    newFolderForm.addEventListener('submit', (e) => {
        location.value = currentLocation.id;
    })

})();


(function handlePostNewFile() {

    let fileName = document.querySelector('.name');

    let fileInput = document.querySelector('#file');

    let fileform = document.getElementById('file-form');

    let progressBar = document.querySelector('.progress-bar')


    function validateFile(file) {
        let sizemb = file.size / 1000000;
        if (sizemb > 5) {
            alert('file too big!');
            return false;
        }
        let allowed = ['application/pdf', 'text/plain']
        if (!file.type.startsWith('image') && !file.type.startsWith('video') && !allowed.includes(file.type)) {
            alert('unknown file type')
            return false;
        }
        return true;

    }

    async function postFile(file) {
        let data = new FormData(fileform);
        let xhr = new XMLHttpRequest()

        progressBar.classList.remove('hide');
        xhr.upload.addEventListener('progress', (e) => {
            let current = e.loaded / e.total;
            progressBar.value = Math.floor(current * 100);
        })

        xhr.upload.addEventListener('loadend', (e) => {
            progressBar.classList.add('hide');
            fileInput.files = null;
        })

        xhr.addEventListener("loadend", (e) => {
            window.location.reload();
        })
        data.append('location', currentLocation.id);
        xhr.open('post', '/home/file');
        xhr.send(data);
    }

    fileInput.addEventListener("change", async (e) => {

        let file = e.target.files[0];

        if (!validateFile(file)) {
            fileInput.files = null;
            return;
        }

        fileName.textContent = file.name;
        await postFile(file);

    })


})()

let toggleDeleteButton = document.querySelector('.toggle-delete-button');
toggleDeleteButton.onclick = () => {
    let deleteButton = document.querySelectorAll('.delete-button');
    deleteButton.forEach((e) => {
        e.classList.toggle('hide');
    });
}

let icon = document.querySelector('.user-icon');
let options = document.querySelector('.options');
icon.onclick = () => { options.classList.toggle('hide') };


let logout = document.querySelector('.logout');
logout.onclick = () => { fetch('/login', { method: 'delete' }).then((res) => { location.replace('/login'); }) }


// logout.onclick = () => { fetch('/login', { method: 'delete' }) }