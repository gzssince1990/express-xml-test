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

	const first_on_the_fly_question = (req, res) => {
		const tid = req.body.tid
		const scanid = req.body.scanid
		const answers = req.body.answers
		const wrong_answer = answers['124'] !== undefined
		const status = wrong_answer ? 0 : 1
		const text = wrong_answer ? 'wrong anwser!!!' : `please review item '${tid}'`

		const xml_tag = builder.create('xml')
		const message_tag = xml_tag.ele('message')
		message_tag.ele('status', status)
		message_tag.ele('text', text)
		message_tag.ele('scanid', scanid)
		const question1 = message_tag.ele('question', { id: 123, type: 'manual', condition: 'post_submit' })
		question1.ele('text', 'What is your favorite sport')
		question1.ele('answer', { id: 1, autofill: 1}, 'Soccer')
		const question2 = message_tag.ele('question', { id: 124, type: 'option', condition: 'post_submit' })
		question2.ele('text', 'How is team WaterSky')
		question2.ele('answer', { id: 2 }, 'Awesome')
		question2.ele('answer', { id: 3 }, 'Aaaaaaaaawesome')
		const question3 = message_tag.ele('question', { id: 125, type: 'barcode', condition: 'post_submit' })
		question3.ele('text', 'Scan a value again, please')
		const xml = xml_tag.end({ pretty: true });
		console.log(xml)
		res.set('Content-Type', 'text/xml');
		res.send(xml)
	}

	const second_on_the_fly_question = (req, res) => {
		const tid = req.body.tid
		const scanid = req.body.scanid

		const xml_tag = builder.create('xml')
		const message_tag = xml_tag.ele('message')
		message_tag.ele('status', 1)
		message_tag.ele('text', `please review item '${tid}'`)
		message_tag.ele('scanid', scanid)
		const question4 = message_tag.ele('question', { id: 126, type: 'barcode', condition: 'post_submit' })
		question4.ele('text', 'Final barcode scan')
		const xml = xml_tag.end({ pretty: true });
		console.log(xml)
		res.set('Content-Type', 'text/xml');
		res.send(xml)
	}

	const normal_question = (req, res) => {
		const xml_tag = builder.create('xml')
		const message_tag = xml_tag.ele('message')
		message_tag.ele('status', 1)
		message_tag.ele('text', "Now you finished everything!!!")
		const xml = xml_tag.end({ pretty: true });
		console.log(xml)
		res.set('Content-Type', 'text/xml');
		res.send(xml)
	}

	api.get('/xml', (req, res) => {
		first_on_the_fly_question(req, res)
	});

	api.post('/xml', (req, res) => {
		console.log(req.body)

		const answers = req.body.answers
		if (answers['124'] !== 'Aaaaaaaaawesome') {
			first_on_the_fly_question(req, res)
		} else if (answers['126'] === undefined) {
			second_on_the_fly_question(req, res)
		} else {
			normal_question(req, res)
		}
	});

	return api;
}
