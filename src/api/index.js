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

	const render_xml = (req, res) => {
		console.log(req.body)
		let xml_tag = builder.create('xml')
		let message_tag = xml_tag.ele('message')
		message_tag.ele('status', 1)
		message_tag.ele('text', 'please review item "A12X"')
		let xml = xml_tag.end({ pretty: true });
		// console.log(xml)
		res.set('Content-Type', 'text/xml');
		res.send(xml)
	}
	api.get('/xml', (req, res) => {
		render_xml(req, res)
	});

	api.post('/xml', (req, res) => {
		render_xml(req, res)
	});

	return api;
}
