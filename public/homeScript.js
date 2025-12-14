const newFileButton = document.querySelector('.new-folder-wrapper');
const newFolderInput = document.querySelector('.folder-name-input');
newFileButton.addEventListener("click", (e) => {
    newFolderInput.classList.toggle('hide');
})

const createFolderButton = document.querySelector('.create-folder-button');


let folders = document.querySelectorAll('.folder-container');

folders.forEach((f) => {
    console.log(f.dataset.id);

    f.addEventListener('click', () => {
        window.location.replace('/folder/' + f.dataset.id);
    })

})

let goBack = document.querySelector('.go-back');
goBack.addEventListener('click', () => {
    let parent = goBack.dataset.id;
    if (parent == '')
        window.location.replace('/');
    else window.location.replace('/folder/' + parent);
})


let uploadedFileName = document.querySelector('.file-name');

let fileInput = document.querySelector('#file');
let fileform = document.getElementById('file-form');
let progressBar = document.querySelector('.progress-bar')

fileInput.addEventListener("change", async (e) => {

    let file = e.target.files[0];
    let sizemb = file.size / 1000000;
    if (sizemb > 5) {
        alert('file too big!');
        fileInput.files = null;
        return;
    }
    let allowed = ['application/pdf', 'text/plain',]
    if (!file.type.startsWith('image') && !file.type.startsWith('video') && !allowed.includes(file.type)) {
        fileInput.files = null;
        alert('unknown file type')
        return
    }
    uploadedFileName.textContent = file.name;
    let data = new FormData(fileform);
    let xhr = new XMLHttpRequest()

    progressBar.classList.toggle('hide');
    xhr.upload.addEventListener('progress', (e) => {
        let current = e.loaded / e.total;
        progressBar.value = Math.floor(current * 100);
    })

    xhr.upload.addEventListener('loadend', (e) => {
        progressBar.classList.toggle('hide');
        fileInput.files = null;
        window.location.reload();
    })
    let current_folder = window.location.pathname;
    data.append('path', window.location.pathname);
    xhr.open('post', '/upload');
    xhr.send(data);

})

