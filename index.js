const express = require('express');
const controller = require('./controllers/controller');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.static('./node_modules/@fortawesome/fontawesome-free'))


app.get('/signup', controller.renderSignup);
app.get('/login', controller.renderLogin);
app.get('/', controller.renderHome)



app.listen(3000);