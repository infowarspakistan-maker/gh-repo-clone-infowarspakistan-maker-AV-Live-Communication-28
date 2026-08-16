const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function run() {
  const dom = await JSDOM.fromURL("http://localhost:3000/shop", {
    runScripts: "dangerously",
    resources: "usable"
  });

  setTimeout(() => {
    const el = dom.window.document.querySelector("div#root:nth-of-type(1) > div:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > span:nth-of-type(2)");
    console.log("Element text on /shop:", el ? el.textContent : "Not found");
    console.log("Element HTML on /shop:", el ? el.outerHTML : "Not found");
    
    // Also try /product/1
    JSDOM.fromURL("http://localhost:3000/product/poly-studio-x50", { runScripts: "dangerously", resources: "usable" }).then(dom2 => {
      setTimeout(() => {
        const el2 = dom2.window.document.querySelector("div#root:nth-of-type(1) > div:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > span:nth-of-type(2)");
        console.log("Element text on /product:", el2 ? el2.textContent : "Not found");
        console.log("Element HTML on /product:", el2 ? el2.outerHTML : "Not found");
        process.exit(0);
      }, 3000);
    });
  }, 3000);
}
run();
