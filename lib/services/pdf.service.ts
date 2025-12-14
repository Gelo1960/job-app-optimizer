
import puppeteer from 'puppeteer';
import { CVContent } from '@/lib/types';

export class PdfService {
    static async generate(content: CVContent): Promise<Buffer> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        const html = this.generateHtml(content);

        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm',
            },
        });

        await browser.close();

        // Puppeteer returns a Uint8Array, we need a Buffer
        return Buffer.from(pdfBuffer);
    }

    private static generateHtml(content: CVContent): string {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Open+Sans:wght@400;600;700&display=swap');
          
          body {
            font-family: 'Open Sans', sans-serif;
            color: #333;
            line-height: 1.5;
            font-size: 11pt;
            max-width: 800px;
            margin: 0 auto;
          }
          
          h1, h2, h3 {
            font-family: 'Merriweather', serif;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          
          .name {
            font-size: 24px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .title {
            font-size: 16px;
            color: #555;
            margin-top: 5px;
            font-weight: 600;
          }
          
          .contact {
            font-size: 12px;
            margin-top: 8px;
            color: #666;
          }
          
          .section {
            margin-bottom: 25px;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 15px;
            color: #222;
          }
          
          .entry {
            margin-bottom: 15px;
          }
          
          .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 5px;
          }
          
          .entry-title {
            font-weight: 700;
            font-size: 14px;
          }
          
          .entry-subtitle {
            font-style: italic;
            color: #555;
            font-family: 'Merriweather', serif;
          }
          
          .entry-date {
            font-size: 12px;
            color: #666;
            white-space: nowrap;
          }
          
          ul {
            margin: 5px 0 0 18px;
            padding: 0;
          }
          
          li {
            margin-bottom: 3px;
          }
          
          .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .skill-category {
            font-weight: 600;
            margin-right: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${content.header.name}</div>
          <div class="title">${content.header.title}</div>
          <div class="contact">
            ${content.header.contact.join(' | ')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div>${content.professionalSummary}</div>
        </div>

        <div class="section">
          <div class="section-title">Experience</div>
          ${content.experience.map(exp => `
            <div class="entry">
              <div class="entry-header">
                <div>
                   <span class="entry-title">${exp.title}</span> – <span class="entry-subtitle">${exp.company}</span>
                </div>
                <div class="entry-date">${exp.period}</div>
              </div>
              <ul>
                ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Education</div>
          ${content.education.map(edu => `
            <div class="entry">
              <div class="entry-header">
                <span class="entry-title">${edu.institution}</span>
                <div class="entry-date">${edu.period}</div>
              </div>
              <div class="entry-subtitle">${edu.degree}</div>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-list">
            ${content.skills.map(skill => `
              <div>
                <span class="skill-category">${skill.category}:</span>
                <span>${skill.items.join(', ')}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </body>
      </html>
    `;
    }
}
