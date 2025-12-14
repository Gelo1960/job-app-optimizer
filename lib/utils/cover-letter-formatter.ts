import { CoverLetter } from '../services/cover-letter-generator.service';

/**
 * Utilitaires pour le formatting de lettres de motivation (fonctions pures, sans appels API)
 */
export class CoverLetterFormatterUtils {
    /**
     * Convertit la lettre de motivation en texte brut (pour export ou preview)
     */
    static convertCoverLetterToText(coverLetter: CoverLetter): string {
        let text = '';

        // Greeting
        text += `${coverLetter.greeting}\\n\\n`;

        // Introduction
        text += `${coverLetter.introduction}\\n\\n`;

        // Body
        text += `${coverLetter.body.credibility}\\n\\n`;
        text += `${coverLetter.body.uniqueValue}\\n\\n`;
        text += `${coverLetter.body.culturalFit}\\n\\n`;

        // Closing
        text += `${coverLetter.closing}\\n\\n`;

        // Signature
        text += `${coverLetter.signature}`;

        return text;
    }

    /**
     * Convertit la lettre de motivation en HTML (pour export PDF ou email)
     */
    static convertCoverLetterToHTML(coverLetter: CoverLetter): string {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 650px;
      margin: 40px auto;
      padding: 20px;
    }
    .greeting {
      margin-bottom: 20px;
    }
    .paragraph {
      margin-bottom: 16px;
      text-align: justify;
    }
    .signature {
      margin-top: 30px;
      white-space: pre-line;
    }
  </style>
</head>
<body>
  <div class="greeting">${coverLetter.greeting}</div>

  <div class="paragraph">${coverLetter.introduction}</div>

  <div class="paragraph">${coverLetter.body.credibility}</div>

  <div class="paragraph">${coverLetter.body.uniqueValue}</div>

  <div class="paragraph">${coverLetter.body.culturalFit}</div>

  <div class="paragraph">${coverLetter.closing}</div>

  <div class="signature">${coverLetter.signature}</div>
</body>
</html>
    `.trim();
    }
}
