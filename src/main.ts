import UserService from "./service/user.service.js";
import SessionService from "./service/session.service.js";
import NoteService from "./service/note.service.js";

import express, {Express, Request, Response} from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

const app: Express = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// This is designed to allow typescript to accept the session record as part of the request payload
declare module 'express-serve-static-core' {
    interface Request {
        session: { userId: string | null }; // Adjust the type according to your session structure
    }
}

// Middleware for handling authentication of the users
const authenticateUser = async (req: Request, res: Response, next: Function) => {
    try {
        const sessionIdCookie = req.cookies['session_id'];
        const session = await SessionService.get(sessionIdCookie);

        if (session === null) return res.cookie("session_id", "").json({
            "task": "session_authenticate",
            "status": "failed"
        });
        if (session.userId === null) return res.cookie("session_id", "").json({
            "task": "get_userid",
            "status": "failed"
        });

        req.session = session; // Add session to request for further use
        next();
    } catch(error: any) {
        console.log(error)
        return res.redirect('/login');
    }
};

/* Views */
app.get('/', authenticateUser, async(req: Request, res: Response) => {
    if(typeof req.session.userId !== "string") return res.status(500).json({ "task": "get_userid", "status": "failed" });
    const notes = await NoteService.list(req.session.userId);
    return res.render('home', { notes });
});

app.get('/login', async(req: Request, res: Response) => {
    return res.render('login');
});

app.get('/note/list', authenticateUser, async(req: Request, res: Response) => {
    try {

        if(typeof req.session.userId !== "string") return res.status(500).json({ "task": "get_userid", "status": "failed" });

        const notes = await NoteService.list(req.session.userId);
        return res.status(200).json(notes)

    } catch(error: any) {
        return res.status(500).json({ "task": "list_note", "status": "failed" });
    }
});

/* Ensure that only the specific user can delete the code in the future */
app.get('/note/delete/:noteId', authenticateUser, async(req: Request, res: Response) => {

    try {

        await NoteService.delete(req.params.noteId);
        return res.redirect('/')

    } catch(error: any) {
        return res.status(500).json({ "task": "delete_note", "status": "failed" });
    }


});


app.post('/note/create', authenticateUser, async(req: Request, res: Response) => {
    try {

        if(typeof req.session.userId !== "string") return res.status(500).json({ "task": "get_userid", "status": "failed" });

        const { title, content } = req.body;
        const note = await NoteService.create(req.session.userId, title, content);
        return res.redirect('/')

    } catch(error: any){
        console.error(error)
        return res.status(500).json({ "task": "create_note", "status": "failed" });
    }
})

app.post('/user/authenticate', async(req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        console.log(email)
        console.log(password)

        const user: { id: string; email: string; password: string } | null = await UserService.authenticate(email, password);




        if(user === null) { return res.status(400).json({ "task": "authenticate_user", "status": "failed" }) }

        const session = await SessionService.create(user.id);
        return res.cookie("session_id", session.id).redirect('/');
    } catch(error: any) {
        return res.status(500).json({ "task": "authenticate_user", "status": "failed" });
    }
});

app.post('/user/create', async(req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user: { id: string; email: string; password: string } | null = await UserService.create(email, password);

        if(user === null) return res.status(500).json({ "task": "create_user", "status": "failed" });
        return res.status(200).json({ "task": "create_user", "status": "success" });

    } catch(error: any) {
        return res.status(500).json({ "task": "create_user", "status": "failed" });
    }
})


app.listen(80)