import { chromium } from "playwright";

import { pathToFileURL } from "node:url";

const [INPUT, OUTPUT, WIDTH, HEIGHT] = process.argv.slice(2);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
});

const page = await browser.newPage();

await page.setViewportSize({
  width: parseInt(WIDTH, 10),
  height: parseInt(HEIGHT, 10),
});

await page.goto(
  pathToFileURL(INPUT).href,
);

const svgLocator = page.locator("svg");

await svgLocator.evaluate((svgElement) => {
  svgElement.setAttribute("width", "auto");
  svgElement.setAttribute("height", "auto");
});

await svgLocator.screenshot({
  path: OUTPUT,
  omitBackground: true,
});

await browser.close();
