const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function run() {
  const dom = await JSDOM.fromURL("http://localhost:3000/", {
    runScripts: "dangerously",
    resources: "usable"
  });

  setTimeout(() => {
    const el = dom.window.document.querySelector("div#root:nth-of-type(1) > div:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > span:nth-of-type(2)");
    console.log("Element text on /:", el ? el.textContent : "Not found");
    console.log("Element HTML on /:", el ? el.outerHTML : "Not found");
    process.exit(0);
  }, 4000);
}
run();
