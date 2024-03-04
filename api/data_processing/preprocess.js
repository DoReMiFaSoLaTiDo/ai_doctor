const fs = require('fs');

// define file paths
const filePath = '../../pythonista/mayo-scraper/results/main.json';
const resultsFilePath = '../../pythonista/mayo-scraper/results/cleanedData.json';
const excludedFilePath = '../../pythonista/mayo-scraper/results/excluded.json';

// Read the source JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) throw err;

    // Parse the JSON data
    let diseases = JSON.parse(data);

    const cleanedDiseases = [];
    const uncapturedDiseases = [];
    // Filter out the diseases with null symptoms or diagnosis
    diseases.forEach(disease => {
      const { name, symptoms, treatment } = disease;
      if (symptoms || treatment) {
        cleanedDiseases.push({
          name,
          diagnosis: cleanWords(treatment, 'diagnosis'),
          symptoms: cleanWords(symptoms, 'symptoms')
        })
      } else {
        uncapturedDiseases.push(disease);
      }
    });

    // Write the cleaned diseases to a new JSON file
    fs.writeFile(resultsFilePath, JSON.stringify(cleanedDiseases, null, 2), 'utf8', (err) => {
      if (err) throw err;
      console.log('The cleaned diseases file has been saved!');
    });

    // Write the uncaptured diseases to a new JSON file
    fs.writeFile(excludedFilePath, JSON.stringify(uncapturedDiseases, null, 2), 'utf8', (err) => {
      if (err) throw err;
      console.log('The uncaptured diseases file has been saved!');
  });

});

const breakers = {
  symptoms: {
    endStrings: ["Products & Services", "Enlarge image", "\nRequest an appointment", "\nMore Information", "\nBy Mayo Clinic Staff"],
    startStrings: ['\nOverview','\n\nSymptoms', '\nClose\n', '\nCauses', '\nRisk factors', '\nPrevention']
  },
  diagnosis: {
    endStrings: ["Enlarge image", "More Information", "Products & Services", "\nRequest an appointment", "\nBy Mayo Clinic Staff"],
    startStrings: ["\nDiagnosis", "\nClose\n", "\nAlternative medicine"]
  }
}

const cleanWords = (words, mode) => {
  if (words == null || words == 'undefined') return '';
  const endStrings = breakers[mode].endStrings;
  const startStrings = breakers[mode].startStrings;
  let endReached = false;
  let startPos = 0;
  let endPos = 0;
  let resultString = ''
  let startKey, endKey;

  while (!endReached) {
    const startArr = getIndex(endPos, startStrings, words);
    startPos = startArr[0];
    startKey = startArr[1];
    const endArr = getIndex(startPos, endStrings, words);
    endPos = endArr[0];
    endKey = endArr[1];
    if (startKey == '\nClose\n') startPos += 6;
    if (endKey == endStrings[-1] || startPos == -1 || endPos == -1) endReached = true;
    if (startPos != -1 && endPos != -1) resultString += words.substring(startPos, endPos);
  }
  resultString = resultString.replace(/(\r\n|\n+|\r|\t)/gm,' ');
  return resultString;
}

const getIndex = (from, searchTerms, words) => {
  let index = -1;
  let key, searchIndex;

  searchTerms.forEach((searchTerm) => {
    searchIndex = words.indexOf(searchTerm, from);
    if (searchIndex != -1 && ((index != -1 && searchIndex < index) || (index == -1))) {
      index = searchIndex;
      key = searchTerm;
    }
  })
  return [index, key];
}
