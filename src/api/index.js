import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import builder from 'xmlbuilder';

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	api.get('/xml', (req, res) => {
		let xml = builder.create('test', 'test').end({ pretty: true });
		res.set('Content-Type', 'text/xml');
		res.send(xml)
	});

	return api;
}
