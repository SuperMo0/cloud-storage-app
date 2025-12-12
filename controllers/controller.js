


function renderSignup(req, res) {
    res.render('signup');
}

function renderLogin(req, res) {
    res.render('login');
}

function renderHome(req, res) {
    res.render('home');
}




module.exports = { renderLogin, renderSignup, renderHome }