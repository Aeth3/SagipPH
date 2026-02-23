/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const checklistPath = path.join(process.cwd(), "tests/manual/MANUAL_TESTING_CHECKLIST.md");
const content = fs.readFileSync(checklistPath, "utf8");

console.log(content);
