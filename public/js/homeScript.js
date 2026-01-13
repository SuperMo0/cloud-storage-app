(function handleDropdown() {
    const newFolderDropdown = document.querySelector('.new-folder-dropdown');
    const newFolderForm = document.querySelector('.new-folder-form');

    if (newFolderDropdown) {
        newFolderDropdown.addEventListener("click", (e) => {
            newFolderForm.classList.toggle('hide');
        });
    }

    const toggleNewFolderMobile = document.querySelector('.add-folder-mobile-toggle');
    const newFolderPageMobile = document.querySelector('.create-folder-mobile');
    const closeNewFolderPage = document.querySelector('.close-new-folder-page-button');

    if (closeNewFolderPage) {
        closeNewFolderPage.addEventListener('click', () => {
            newFolderPageMobile.classList.add('hide');
        });
    }

    if (toggleNewFolderMobile) {
        toggleNewFolderMobile.addEventListener("click", () => {
            newFolderPageMobile.classList.remove('hide');
        });
    }
})();

let mainContent = document.querySelector('.main-content');
let folders = [];
let files = [];
let foldersMap = new Map();
let root = mainContent.dataset.rootid;
let currentLocation = root;
let pathList = ['My Drive'];

(function populate() {
    if (!mainContent) return;
    folders = JSON.parse(mainContent.dataset.folders || "[]");
    files = JSON.parse(mainContent.dataset.files || "[]");
    currentLocation = mainContent.dataset.currentlocation;

    for (let folder of folders) {
        foldersMap.set(folder.id, { name: folder.name, id: folder.id, parent_id: folder.parent_id, folders: [], files: [] });
    }

    for (let folder of folders) {
        if (folder.parent_id == null) continue;
        let parent = foldersMap.get(folder.parent_id);
        if (parent) parent.folders.push(folder);
    }

    for (let file of files) {
        let parent = foldersMap.get(file.parent_id);
        if (parent) parent.files.push(file);
    }
})();

(function buildTree() {
    let builder = function (currentLocation, parent) {
        if (!currentLocation) return;
        currentLocation.parent = parent;
        for (let i = 0; i < currentLocation.folders.length; i++) {
            let child = currentLocation.folders[i];
            child = foldersMap.get(child.id);
            currentLocation.folders[i] = builder(child, currentLocation);
        }
        return currentLocation;
    }
    if (foldersMap.get(root)) {
        root = builder(foldersMap.get(root), null);
    }
})();

let filesOperations = (function handleFilesOperations() {

    let imagePreviewContainer = document.querySelector('.image-preview-container');
    let img = document.createElement('img');
    let download = document.querySelector('.download-media');
    img.classList.add('image-preview');

    let video = document.createElement('video');
    video.setAttribute("loop", "true");
    video.setAttribute("controls", "true");
    video.classList.add('video-preview');

    let shareButton = document.querySelector('.share-button');
    let shareForm = document.querySelector('.share-file-form');

    if (shareButton) {
        shareButton.onclick = (e) => {
            if (!download.file) return;
            shareForm.classList.remove('hide');
        }
    }

    if (shareForm) {
        shareForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let data = new FormData(e.target);
            data.append('file_id', download.file.id);

            try {
                let res = await fetch('/home/share', { method: "post", body: new URLSearchParams(data) });
                res = await res.json();
                let url = res.url
                navigator.clipboard.writeText(url);
                showNotification('Link copied to clipboard');
                shareForm.classList.add('hide');
            } catch (err) {
                console.error(err);
            }
        });
    }

    function showNotification(message) {
        let notification = document.querySelector('.notification');
        notification.textContent = message;
        notification.classList.add('visable');
        setTimeout(() => {
            notification.classList.remove('visable');
        }, 3000)
    }

    function isMedia(type) {
        return (type.startsWith('image') || type.startsWith('video'));
    }

    function isPdf(type) {
        return (type === 'application/pdf');
    }

    function clearPreviews() {
        if (imagePreviewContainer) imagePreviewContainer.replaceChildren();
        if (shareForm) shareForm.classList.add('hide');
    }

    function handlePreview(f, url) {
        const previewMobile = document.querySelector('.right-side-bar');

        if (window.innerWidth < 900) {
            previewMobile.style.display = 'flex';
        }

        clearPreviews();


        if (!f) {
            let p = document.createElement('p');
            p.innerText = "Select a file to preview";
            p.style.color = "var(--text-muted)";
            imagePreviewContainer.appendChild(p);
            return;
        }

        if (f.type.startsWith('image')) {
            img.src = url;
            imagePreviewContainer.appendChild(img);
        }
        else if (f.type.startsWith('video')) {
            video.src = url;
            imagePreviewContainer.appendChild(video);
        }
        else {
            let p = document.createElement('p');
            p.textContent = f.name;
            p.style.padding = "10px";
            imagePreviewContainer.appendChild(p);
        }

        if (download) download.file = f;
    }

    if (download) {
        download.onclick = () => {
            handleFileDownload(download.file);
        }
    }

    async function handleFileClick(file) {
        try {
            let res = await fetch('/home/file/' + file.id);
            res = await res.json();
            let url = res.url;
            handlePreview(file, url);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleFileDownload(file) {
        if (!file) return;
        try {
            let res = await fetch('/home/file/' + file.id + '?download=true');
            res = await res.json();
            let url = res.url;


            let data = await fetch(url);
            let blob = await data.blob();
            let objUrl = URL.createObjectURL(blob);

            let a = document.createElement('a');
            a.setAttribute("download", file.name);
            a.href = objUrl;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(objUrl);
        } catch (err) {
            console.error("Download failed", err);
        }
    }

    return { handleFileClick, isMedia, isPdf, clearPreviews }

})();

(function handleNavigation() {
    if (!foldersMap.get(currentLocation)) return;

    currentLocation = foldersMap.get(currentLocation);


    pathList = ['My Drive'];
    let crnt = currentLocation;
    let tempPath = [];
    while (crnt.id != root && crnt.parent != null) {
        tempPath.push(crnt.name);
        crnt = crnt.parent;
    }
    pathList = pathList.concat(tempPath.reverse());

    let foldersContainer = document.querySelector('.folders-container');
    let folderTemplate = document.querySelector('.folder-container');

    if (!folderTemplate) return;
    folderTemplate = folderTemplate.cloneNode(true);
    folderTemplate.classList.remove('hide');

    let filesContainer = document.querySelector('.files-container');
    let mediaFileTemplate = document.querySelector('.file-container.media').cloneNode(true);
    mediaFileTemplate.classList.remove('hide');

    let pdfFileTemplate = document.querySelector('.file-container.pdf').cloneNode(true);
    pdfFileTemplate.classList.remove('hide');

    let generalFileTemplate = document.querySelector('.file-container.general').cloneNode(true);
    generalFileTemplate.classList.remove('hide');

    let handleDelete = async function (file_id) {
        if (!confirm("Are you sure you want to delete this?")) return;

        let res = await fetch('/home', {
            method: 'delete',
            body: new URLSearchParams({ id: file_id, location: currentLocation.id })
        })
        if (res.ok) window.location.reload();
        else alert('Error deleting file');
    }

    let showDirecotory = function (folder) {
        let locationUrl = window.location.href.split('?')[0] + `?location=${folder.id}`;
        window.history.pushState({}, '', locationUrl);

        filesContainer.replaceChildren();
        foldersContainer.replaceChildren();

        for (let f of folder.folders) {
            let newFolder = folderTemplate.cloneNode(true);
            newFolder.querySelector('.folder-name').textContent = f.name;
            newFolder.onclick = (e) => {
                if (e.target.classList.contains('delete-button') || e.target.closest('.delete-button')) return;
                filesOperations.clearPreviews();
                pathList.push(f.name);
                showDirecotory(f);
                currentLocation = f
            }

            let deleteButton = newFolder.querySelector('.delete-button');
            deleteButton.onclick = (e) => {
                e.stopPropagation();
                handleDelete(f.id)
            };
            foldersContainer.appendChild(newFolder);
        }

        for (let f of folder.files) {
            let newFile;
            if (filesOperations.isMedia(f.type)) newFile = mediaFileTemplate.cloneNode(true);
            else if (f.type === 'application/pdf') newFile = pdfFileTemplate.cloneNode(true);
            else newFile = generalFileTemplate.cloneNode(true);

            newFile.querySelector('.file-name').textContent = f.name;
            newFile.querySelector('.file-size').textContent = ((f.size / 1000000)).toFixed(2) + "MB";

            let dateEl = newFile.querySelector('.file-creation-time');
            if (dateEl) dateEl.textContent = f.created_at.slice(0, 10);

            newFile.onclick = (e) => {
                if (e.target.classList.contains('delete-button') || e.target.closest('.delete-button')) return;
                filesOperations.handleFileClick(f)
            };

            let deleteButton = newFile.querySelector('.delete-button');
            deleteButton.onclick = (e) => {
                e.stopPropagation();
                handleDelete(f.id)
            };
            filesContainer.appendChild(newFile);
        }

        let path = document.querySelector('.path');
        path.textContent = pathList.join(' / ');
    }

    let backButton = document.querySelector('.go-back');
    function navigateBack() {
        if (currentLocation.id == root) return;
        pathList.pop();
        currentLocation = currentLocation.parent;
        if (currentLocation) showDirecotory(currentLocation);
    }
    if (backButton) backButton.onclick = navigateBack;

    showDirecotory(currentLocation);
})();

// Forms Handling
(function handlePostNewFolder() {
    let newFolderForm = document.querySelector('.new-folder-form');
    let newFolderFormMobile = document.querySelector('.new-folder-form-mobile');

    if (newFolderForm) {
        newFolderForm.addEventListener('submit', (e) => {
            let loc = newFolderForm.querySelector('input[name="location"]');
            if (loc) loc.value = currentLocation.id;
        });
    }

    if (newFolderFormMobile) {
        newFolderFormMobile.addEventListener('submit', (e) => {
            let loc = newFolderFormMobile.querySelector('input[name="location"]');
            if (loc) loc.value = currentLocation.id;
        });
    }

    const closepPreviewMobile = document.querySelector('.close-preview-mobile');
    const previewMobile = document.querySelector('.right-side-bar');

    if (closepPreviewMobile && previewMobile) {
        closepPreviewMobile.addEventListener("click", () => {
            previewMobile.style.display = 'none';
        });
    }
})();

(function handlePostNewFile() {

    let fileName = document.querySelector('.name');
    let progressBar = document.querySelector('.progress-bar');

    let fileInputs = document.querySelectorAll('input[type="file"]');

    function validateFile(file) {
        let sizemb = file.size / 1000000;
        if (sizemb > 10) {
            alert('File too big! (Max 50MB)');
            return false;
        }
        return true;
    }

    async function postFile(file, formElement) {
        let data = new FormData();
        data.append('file', file);
        data.append('location', currentLocation.id);

        let xhr = new XMLHttpRequest()

        if (window.Notyf) {
            var notyf = new window.Notyf({ duration: 0, ripple: true, position: { x: 'right', y: 'bottom' } });
            notyf.success('Uploading...');
        }

        if (progressBar) progressBar.classList.remove('hide');

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                let current = e.loaded / e.total;
                if (progressBar) progressBar.value = Math.floor(current * 100);
            }
        })

        xhr.upload.addEventListener('loadend', (e) => {
            if (progressBar) progressBar.classList.add('hide');
        })

        xhr.addEventListener("loadend", (e) => {
            if (xhr.status >= 200 && xhr.status < 300) {
                if (window.Notyf) {
                    notyf.dismissAll();
                    notyf.success('Upload successful');
                }
                setTimeout(() => window.location.reload(), 1000);
            } else {
                if (window.Notyf) notyf.error('Upload failed');
            }
        })

        xhr.open('post', '/home/file');
        xhr.send(data);
    }

    fileInputs.forEach(input => {
        input.addEventListener("change", async (e) => {
            let file = e.target.files[0];
            if (!file) return;

            if (!validateFile(file)) {
                input.value = ""; // Reset
                return;
            }

            if (fileName) fileName.textContent = file.name;
            await postFile(file);
        });
    });

})()

let toggleDeleteButton = document.querySelector('.toggle-delete-button');
if (toggleDeleteButton) {
    toggleDeleteButton.onclick = () => {
        let deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach((e) => {
            e.classList.toggle('hide');
        });
    }
}

let icon = document.querySelector('.user-icon');
let options = document.querySelector('.options');
if (icon && options) {
    icon.onclick = () => { options.classList.toggle('hide') };
}

let logout = document.querySelector('.logout');
if (logout) {
    logout.onclick = () => {
        fetch('/login', { method: 'delete' }).then(() => { location.replace('/login'); })
    }
}