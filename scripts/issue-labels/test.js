const fs = require("fs");
const path = require("path");

const { classifyIssueText } = require("./index.js");

const samplesPath = path.join(__dirname, "samples.json");
const samples = JSON.parse(fs.readFileSync(samplesPath, "utf8"));

function sortArray(arr) {
  return (arr || []).map(String).sort();
}

function isSubset(sub, sup) {
  const set = new Set(sup || []);
  for (const x of sub || []) {
    if (!set.has(x)) return false;
  }
  return true;
}

let passed = 0;
let failed = 0;

for (const sample of samples) {
  try {
    const result = classifyIssueText(sample.title, sample.body);

    const expectedType = sample.expected_type === undefined ? null : sample.expected_type;
    const matchType = expectedType === null ? true : (result.type || null) === expectedType;
    const actualDomains = sortArray(result.domains);
    const expectedDomains = sortArray(sample.expected_domains);
    const matchDomains = isSubset(expectedDomains, actualDomains);

    if (matchType && matchDomains) {
      console.log(`✅ Passed: ${sample.name}`);
      passed += 1;
    } else {
      console.log(`❌ Failed: ${sample.name}`);
      console.log(`   Type expected: ${expectedType}, got: ${result.type}`);
      console.log(`   Domains expected(subset): ${expectedDomains}, got: ${actualDomains}`);
      failed += 1;
    }
  } catch (e) {
    console.log(`❌ Failed: ${sample.name} (Execution error)`);
    console.error(e && e.message ? e.message : String(e));
    failed += 1;
  }
}

console.log(`\nTest Summary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
