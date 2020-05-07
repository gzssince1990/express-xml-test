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
		const question1 = message_tag.ele('question', { id: 123, type: 'manual', condition: 'post_submit' })
		question1.ele('text', 'What is your favorite sport')
		question1.ele('answer', { id: 1, autofill: 1}, 'Soccer')
		const question2 = message_tag.ele('question', { id: 124, type: 'checkbox', condition: 'post_submit' })
		question2.ele('text', 'How is team WaterSky')
		question2.ele('anwser', { id: 2 }, 'Awesome')
		// question2.ele('anwser', { id: 3 }, 'Aaaaaaaaawesome')
		const question3 = message_tag.ele('question', { id: 125, type: 'manual', condition: 'post_submit' })
		question3.ele('text', 'What is your favorite sport')
		question3.ele('answer', { id: 4, autofill: 4 }, 'Basketball')
		const xml = xml_tag.end({ pretty: true });
		console.log(xml)
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
