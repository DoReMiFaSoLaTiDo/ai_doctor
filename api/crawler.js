const got = require('got');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const baseUrl = 'https://www.mayoclinic.org/diseases-conditions/index';
let linksArray = [];

async function crawlData() {
  try {
    fs.mkdirSync(path.join(__dirname, 'pages'));

    alphabet.forEach(async (char) => {
      const queryString = `letter=${char}`;
      const fullUrl = [baseUrl, queryString].join('?');
      const response = await got(fullUrl);
      const dom = new JSDOM(response.body);
      dom.window.document.querySelectorAll('a.cmp-result-name__link').forEach((linkElement) => {
        linksArray.push({ href: linkElement.href, name: linkElement.innerHTML });
      });

      fs.writeFileSync(path.join(__dirname, `pages/base${char}.json`), JSON.stringify({linksArray}), 'utf-8')
    })
  } catch (error) {
    console.error('Error:', error);
  }

  return linksArray
}

crawlData().then((linksData) => fs.writeFileSync(path.join(__dirname, `pages/base.json`), JSON.stringify({linksData}), 'utf-8'));