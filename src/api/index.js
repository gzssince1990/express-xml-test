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
		const tid = req.body.tid

		const xml_tag = builder.create('xml')
		const message_tag = xml_tag.ele('message')
		message_tag.ele('status', 1)
		message_tag.ele('text', `please review item '${tid}'`)
		message_tag.ele('scanid', 'SCAN_ID_IF_DSU')
		const question1 = message_tag.ele('question', { id: 123, type: "manual", condition: "post_submit"})
		question1.ele('text', 'How is team WaterSky')
		question1.ele('answer', { id: 1, autofill: 1}, 'awesome')
		const xml = xml_tag.end({ pretty: true });
		// console.log(xml)
		res.set('Content-Type', 'text/xml');
		res.send(xml)
	}
	api.get('/xml', (req, res) => {
		render_xml(req, res)
	});

	api.post('/xml', (req, res) => {
		console.log(req.body)

		render_xml(req, res)
	});

	return api;
}
