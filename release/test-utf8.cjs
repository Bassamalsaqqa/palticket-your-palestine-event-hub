const fs = require("fs");

const s = fs.readFileSync("Arabic.json", "utf8");

console.log(s.includes("صوت الميلاد") ? "OK: Arabic present" : "FAIL");

const m = s.match(/"title":\s*"([^"]+)"/);
console.log(m ? m[1] : "NO MATCH");
