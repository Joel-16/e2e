import 'reflect-metadata';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import './utils/customSuccess';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import {getKey, processKey } from "./controllers/keys"

export const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('combined'));

app.get('/keys', getKey )
app.post('/keys', processKey)
app.use('/', routes);
app.use(errorHandler);

app.listen(4000, () => {
  console.log(`Server running on port 4000`);
});
