const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');
const cheerio = require('cheerio');
const got = require('got');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');
// const { gotScraping } = require('got-scraping');

const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const alphabeta = ['A'];
const baseUrl = 'https://www.mayoclinic.org/diseases-conditions/index';
const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0";
let linksArray = [];


async function crawlData() {
  try {
    if (!(fs.existsSync(path.join(__dirname, 'pages'))))
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

const fetchDiseaseData = async (callback) => {
  const browser = await puppeteer.launch();
  
  try {
    alphabeta.forEach(async (char) => {
      const diseaseObjectData = [];
      // read file and parse data into an array of objects for each disease page
      const baseJson = fs.readFileSync(path.join(__dirname, `pages/base${char}.json`), { encoding: 'utf8', flag: 'r' });
      const baseJsonParsed = JSON.parse(baseJson);
      const linksArray = baseJsonParsed['linksArray'];
      let count = 0;
      linksArray.forEach(async (diseasePageObject, index) => {
        const diseaseHref = diseasePageObject.href;
        const diseaseName = diseasePageObject.name;
        // parse the data from that page into an array of objects for each disease in it
        const page = await browser.newPage();
        const userAgent = new UserAgent();
        console.log('myUserAgent:', userAgent.toString());
        await page.setDefaultTimeout(120000);
        await page.setDefaultNavigationTimeout(120000);
        await page.setUserAgent(userAgent.toString());
          
        try {
          await page.goto(diseaseHref, { waitUntil: 'load', timeout: 120000 });
        } catch (e) {
          console.log(`error is at line 63: ${e}`);
        }
          
        try {
          const elements = await page.waitForSelector('div.row');
          console.log(`Num elements = ${element.length}`);
          if (elements.length >= 3) {
            const diseaseText = await elements[3].innerText;
            console.log('dip: ', diseaseText);

            if (diseaseText.length) {
              diseaseObjectData.push({
                diseaseName,
                diseaseText
              });
            }
          }
          
        } catch (e) {
          console.log(`err at line 69: ${e}`);
        } finally {
          count += 1;
        }
      })
      if (diseaseObjectData.length) {
        fs.writeFileSync(path.join(__dirname, `pages/data${char}_${diseaseObjectData.length}.json`), JSON.stringify({diseaseObjectData}), 'utf-8');
      }
      if (count == linksArray.length) {
        await browser.close();
      }
    });
  } catch (error){
    console.log(`failing: ${error}`);
  } 
};

const fetchDiagnosisLinks = () => {
  const allLinks = alphabeta.map((char) => {
    const baseJson = fs.readFileSync(path.join(__dirname, `pages/base${char}.json`), { encoding: 'utf8', flag: 'r' });
    const baseJsonParsed = JSON.parse(baseJson);
    const linksArray = baseJsonParsed['linksArray'];
    const diagnosisLinks = linksArray.map(async (diseaseObject) => {
      try {
        const response = await got(diseaseObject.href);
        const dom = new JSDOM(response.body);
        const href = dom.window.document.querySelector('a#et_genericNavigation_diagnosis-treatment')
        if (href.length == 1) {
          return { diagnosisUrl: href.href, diseaseName: diseaseObject.innerHTML }
        }
      } catch(e) {
        console.error(`For Char: ${char} got error: ${e}`);
      }
    })
    if (diagnosisLinks.length) {
      fs.writeFileSync(path.join(__dirname, `pages/diagnosis_${char}.json`), JSON.stringify({diagnosisLinks}), 'utf-8');
    }
    return diagnosisLinks;
  })

  if (allLinks.length) {
    fs.writeFileSync(path.join(__dirname, `pages/dianosisAll_${allLinks.length}.json`), JSON.stringify({allLinks}), 'utf-8');
  }
}

// crawlData().then((linksData) => fs.writeFileSync(path.join(__dirname, `pages/base.json`), JSON.stringify({linksData}), 'utf-8'));
(async () => {
  console.log('Starting off...');
  
  // fetchDiseaseData(async (response) => {
  //   console.log(`I \'m back! with response ${response}`);
  // });
  await fetchDiagnosisLinks();
}) ();
