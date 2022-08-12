import { parse } from 'node-html-parser';
import fs from 'fs';

export default async function ({content}) {
  const root = parse(content);
  const images = root.querySelectorAll(`img[src*=".svg"]`);

  images.forEach((img) => {
    const contents = fs.readFileSync("static/" + img.getAttribute("src"), "utf8")
      .replace(/<\?xml.+\?>/g, "");

    const svgElement = parse(contents).querySelector("svg");
    svgElement.removeAttribute("id");

    svgElement.setAttributes({
      ...svgElement.attributes,
      ...img.attributes
    });

    const altText = img.getAttribute("alt");

    if (altText) {
      const titleElement = svgElement.querySelector("title");

      if (titleElement) {
        titleElement.set_content(altText);
      } else {
        svgElement.appendChild(parse(`<title>${altText}</title>`));
      }
    }

    svgElement.querySelectorAll("metadata").forEach(element => element.remove());
    svgElement.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));

    img.replaceWith(svgElement);
  });

  const code = root.toString();

  return {code};
}