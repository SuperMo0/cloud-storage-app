import passport from "passport";
import localStrategy from 'passport-local'
import queries from "../db/queries.js";
import bcrypt from 'bcrypt'


const strategy = new localStrategy({ usernameField: 'email' }, async (username, password, cb) => {

    const user = await queries.getUserByEmail(username);
    if (!user) return cb(null, false, { message: "Wrong credentials" });

    const hash = user.password;
    const result = bcrypt.compareSync(password, hash);
    if (!result) return cb(null, false, { message: "Wrong credentials" });

    return cb(null, user);
})

passport.serializeUser(function (user, cb) {
    return cb(null, { id: user.id });
});

passport.deserializeUser(async function (userdata, cb) {
    let user = await queries.getUserByid(userdata.id);
    return cb(null, user);
});

passport.use(strategy);


export default passport;