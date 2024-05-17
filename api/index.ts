import express, {Request, Response} from 'express'
import router from './routes/routes'
import cors from 'cors'

import * as dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
app.get('/', (req: Request, res: Response)=>{
    res.status(200).json({'message': 'Landing Page'});
})

const PORT: number = 3000;
app.listen(PORT, ()=>{
    console.log(`Successfully started on PORT ${PORT}`);
})

module.exports = app;