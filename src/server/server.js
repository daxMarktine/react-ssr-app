import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { createWriteStream } from 'fs';

// SSR setting
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Template from '../template/Template';
import devBundle from './devBundle';

// Setting up the express server
const app = express();
// create a write stream (in append mode)
const accessLogStream = createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const CURRENT_WORKING_DIR = process.cwd();
devBundle.compile(app);

app.use(express.json());
app.use(express.urlencoded({ extends: true }));
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: accessLogStream }));

app.use((err, req, res, next) => {
	if (err.name === 'UnauthorizedError') {
		res.status(401).json({ error: err.name + ': ' + err.message });
	} else if (err) {
		res.status(400).json({ error: err.name + ': ' + err.message });
		console.log(err);
	}
});

export default app;
