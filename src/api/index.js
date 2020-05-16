import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import demo from './demo';
import builder from 'xmlbuilder';

const ITEMS = [
	{
		id: 1,
		name: 'test1',
		location: 'NJ1',
	},
	{
		id: 2,
		name: 'test2',
		location: 'NJ2',
	},
	{
		id: 3,
		name: 'test3',
		location: 'NJ3'
	},
]

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	api.use('/xml', demo)

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	api.post('/preload', (req, res) => {
		preloadHandler(req, res)
	})

	const findItemByScanVal = (scanVal) => {
		ITEMS.find((item) => {
			item.name === scanVal
		})
	}

	const nextItem = (scanVal) => {
		if (scanVal === undefined) {
			return ITEMS[0]
		}

		if (scanVal === 'test3') {
			return null
		}

		return ITEMS[findItemByScanVal(scanVal).id]
	}

	const isLastItem = (scanVal) => {
		nextItem(scanVal) === null
	}

	const preloadHandler = (req, res) => {
		const tid = req.body.tid
		const answers = req.body.answers
		const caseScanAnser = answers['1108']
		const nextItemObj = nextItem(caseScanAnser)
		let xml;

		if (isLastItem(caseScanAnser)) {
			xml = buildEndXML()
		} else {
			xml = buildNextItemXML(nextItemObj)
		}

		console.log(xml)
		res.set('Content-Type', 'text/xml');
		res.send(xml)
	}

	const buildNextItemXML = (item) => {
		const root = builder.create('xml')
		const messageNode = root.ele('message')
		messageNode.ele('status', 1)
		messageNode.ele('text', `next item is in ${item['location']} zone. please find and scan it.`)
		const q1 = messageNode.ele('question', {
			id: 1108,
			type: 'barcode',
			condition: 'post_submit'
		})
		q1.ele('text', 'scan the case you found, please.')
		return root.end({ pretty: true })
	}

	const buildEndXML = () => {
		const xml_tag = builder.create('xml')
		const message_tag = xml_tag.ele('message')
		message_tag.ele('status', 1)
		message_tag.ele('text', "congrats! done!")
		const xml = xml_tag.end({ pretty: true });
		console.log(xml)
		res.set('Content-Type', 'text/xml');
		res.send(xml)
	}

	return api;
}
