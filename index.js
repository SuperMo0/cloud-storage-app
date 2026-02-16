import 'dotenv/config';
import express from 'express';
import loginRouter from './routes/login.js'
import signupRouter from './routes/signup.js'
import homeRouter from './routes/home.js'
import session from './lib/session.js';
import passport from './lib/passport.js';


const app = express();


app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(express.static('./node_modules/@fortawesome/fontawesome-free')); // serving this whole file is definetly a bad idea
app.use(session);
app.use(passport.authenticate('session'));


app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/home', homeRouter)
app.get('/', (req, res) => {
    res.redirect('/home');
})

app.get('/error', (req, res) => {
    res.render('error');
})

app.use((req, res) => {
    res.render('page404.ejs');
})

app.use((error, req, res, next) => {
    res.status = 500;
    res.render('error', { error });
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`server is listening on port: ${port}`);
});