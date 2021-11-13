import config from '../../config/config';
import app from './server';

(async () => {
	await app.listen(config.port, () => {
		try {
			console.info(`Express -> Server is running on the ${config.port}`);
		} catch (e) {
			console.error('Express -> ', e.message);
		}
	});
})();
