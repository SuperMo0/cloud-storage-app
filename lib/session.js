import express_session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import prismaClient from './../lib/prisma.js'

const session = express_session({
    saveUninitialized: false,
    resave: false,
    secret: 'some secret password',
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    store: new PrismaSessionStore(
        prismaClient,
        {
            checkPeriod: 24 * 60 * 60 * 1000,  //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
    )
})
export default session


