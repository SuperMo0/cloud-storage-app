

export function renderLogin(req, res) {

    let messages = req.session.messages || [];

    req.session.messages = [];

    res.render('login', { messages });
}

export function redirectHome(req, res) {
    res.redirect('/login')
}

export function logout(req, res, next) {
    if (!req.user) return res.redirect('/login');
    req.logout((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.redirect('login');
    })
}