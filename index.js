const puppeteer = require('puppeteer');
const json2csv = require('json2csv').parse;
const fs = require('fs');

const fields = ['neighborhood', 'category', 'name', 'link', 'description', 'address'];
const opts = { fields };

async function parseRestaurantInfo() {
  // const browser = await puppeteer.launch({devtools: true, headless: false});
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
	await page.goto('https://sf.eater.com/2016/7/28/11706330/best-date-spots-restaurants-bars-cafes-san-francisco', { waitUntil: 'domcontentloaded' });

	data = await page.evaluate(() => {
		const results = [];
		const ENDING_TAG = 'H2';
		const ANCHOR_TAG = 'A';
		const STRONG_TAG = 'STRONG';
		const ADDRESS_TAG = 'EM';

		function getNextElement(node) {
			return node.nextElementSibling;
		}

		function notEndOfSection(node) {
			return !(node === null || node.tagName === ENDING_TAG);
		}

		function isNodeRestaurant(node) {
			return node.childNodes.length >= 5 && node.childNodes[0].tagName === STRONG_TAG && node.childNodes[1].tagName === ANCHOR_TAG;
		}

		function getRestaurantDetails(node) {
			const [category, a, _, ...rest] = node.childNodes;
			let address = rest.pop();
			if (address.tagName !== ADDRESS_TAG) {
				address = rest.pop();
			}
			const description = rest.map(group => group.textContent).join('').trim();
			
			return {
				description,
				category: category.innerText.replace(':', '').trim(),
				name: a.innerText.trim(),
				link: a.getAttribute('href'),
				address: address.innerText.trim(),
			};
		}
		const areas = Array.from(document.querySelectorAll('h2'));
		console.log(`${areas.length} h2s`);
		areas.forEach((area, index) => {
			/**
			 * the first H2 is not a neighborhood
			 */
			if (index > 0) {
				const neighborhood = area.innerText;
				let node = getNextElement(area);
				while (notEndOfSection(node)) {
					if (isNodeRestaurant(node)) {
						const restauarantDetails = getRestaurantDetails(node);
						results.push({...restauarantDetails, neighborhood});
					}
					node = getNextElement(node);
				}
			}
			console.log('END OF SECTION');
		});

		return results;
	});

	console.log(data[0]);
  
	browser.close();
	
	return data;
}

parseRestaurantInfo()
	.then((res) => {
		console.log(`got ${res.length} restaurants`);
		try {
			const csv = json2csv(res, opts);
			fs.writeFile('restaurants.csv', csv, 'utf8', function (err) {
				if (err) {
					console.log('Some error occured - file either not saved or corrupted file saved.');
				} else{
					console.log('It\'s saved!');
				}
			});
		} catch (err) {
			console.error(err);
		}
	})
	.catch((err) => console.log(`ERROR: ${err}`));