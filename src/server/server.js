import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { createWriteStream } from 'fs';
import bodyParser from 'body-parser';

// SSR setting
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Template from '../template/Template';
import { StaticRouter } from 'react-router-dom';
import devBundle from './devBundle';
import config from '../../config/config';
import MainRouter from '../client/MainRouter';

// Setting up the express server
const app = express();
// create a write stream (in append mode)
const accessLogStream = createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const CURRENT_WORKING_DIR = process.cwd();
devBundle.compile(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: accessLogStream }));
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')));

app.get('*', (req, res) => {
	const context = {};
	const markup = ReactDOMServer.renderToString(
		<StaticRouter location={req.url} context={context}>
			<MainRouter />
		</StaticRouter>,
	);
	if (context.url) {
		return res.redirect(303, context.url);
	}
	res.status(200).send(Template({ markup: markup }));
});

app.use((err, req, res, next) => {
	if (err.name === 'UnauthorizedError') {
		res.status(401).json({ error: err.name + ': ' + err.message });
	} else if (err) {
		res.status(400).json({ error: err.name + ': ' + err.message });
		console.log(err);
	}
});

app.listen(config.port, () => {
	try {
		console.info(`Express -> Server is running on the ${config.port}`);
	} catch (e) {
		console.error('Express -> ', e.message);
	}
});

export default app;
