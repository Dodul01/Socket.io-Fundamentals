import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import router from './routes';

const app: Application = express();

// perser 
app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true,
}));

// router
app.use('/api/v1', router);

// live response 
app.get('/', (req: Request, res: Response) => {
    res.send({ status: true, message: 'Server is running.' });
});

export default app;