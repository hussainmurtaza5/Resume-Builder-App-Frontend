import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import ResumePreview from '../components/ResumePreview';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Sans+3:wght@400;600;700&family=Montserrat:wght@400;500;600;700&family=Nunito+Sans:wght@400;600;700&family=Merriweather:wght@400;700&family=Lora:wght@400;600;700&family=Playfair+Display:wght@500;600;700&family=Libre+Baskerville:wght@400;700&family=Roboto+Slab:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';

/**
 * Builds a standalone, print-ready HTML document for the current resume.
 * The markup comes from the same components that power the live preview, so
 * what gets printed is exactly what the user sees.
 */
export function buildResumeHtml({ data, templateId, fontId, title = 'Resume' }) {
  const markup = renderToStaticMarkup(
    createElement(ResumePreview, { data, templateId, fontId, mode: 'print' }),
  );

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="${FONT_HREF}" rel="stylesheet" />
    <style>
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    </style>
  </head>
  <body>${markup}</body>
</html>`;
}

/**
 * Opens the print-ready document in a new window and triggers the browser
 * print dialog (which also allows "Save as PDF").
 */
export function printResume(options) {
  const html = buildResumeHtml(options);
  const printWindow = window.open('', '_blank', 'width=920,height=1150');
  if (!printWindow) return false;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => printWindow.print(), 600);
  return true;
}

export default printResume;
