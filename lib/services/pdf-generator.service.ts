import puppeteer, { Browser, Page } from 'puppeteer';
import { CVContent, CoverLetterContent } from '@/lib/types';
import { generateCVHTML } from '@/lib/templates/cv-template';
import { generateCoverLetterHTML } from '@/lib/templates/cover-letter-template';

// ============================================================================
// CONFIGURATION PUPPETEER
// ============================================================================

const PUPPETEER_CONFIG = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
  ],
};

const PDF_CONFIG = {
  format: 'A4' as const,
  printBackground: true,
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm',
  },
  preferCSSPageSize: false,
};

const TIMEOUT = 30000; // 30 seconds

// ============================================================================
// SERVICE PDF GENERATOR
// ============================================================================

export class PDFGeneratorService {
  private browser: Browser | null = null;

  /**
   * Initialise le browser Puppeteer
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch(PUPPETEER_CONFIG);
    }
    return this.browser;
  }

  /**
   * Crée une page Puppeteer configurée
   */
  private async createPage(): Promise<Page> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    // Configuration viewport pour A4
    await page.setViewport({
      width: 794,  // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
    });

    return page;
  }

  /**
   * Génère un PDF depuis du HTML
   */
  private async generatePDFFromHTML(html: string): Promise<Buffer> {
    let page: Page | null = null;

    try {
      page = await this.createPage();

      // Injecter le HTML
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: TIMEOUT,
      });

      // Attendre que les fonts soient chargées
      await page.evaluateHandle('document.fonts.ready');

      // Générer le PDF
      const pdf = await page.pdf(PDF_CONFIG);

      return Buffer.from(pdf);
    } catch (error) {
      console.error('[PDFGeneratorService] Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Cleanup de la page
      if (page) {
        await page.close().catch(err => {
          console.error('[PDFGeneratorService] Error closing page:', err);
        });
      }
    }
  }

  /**
   * Génère un PDF pour un CV
   */
  async generateCVPDF(cvContent: CVContent): Promise<Buffer> {
    try {
      console.log('[PDFGeneratorService] Generating CV PDF...');

      // Générer le HTML du CV
      const html = generateCVHTML(cvContent);

      // Convertir en PDF
      const pdf = await this.generatePDFFromHTML(html);

      console.log('[PDFGeneratorService] CV PDF generated successfully');
      return pdf;
    } catch (error) {
      console.error('[PDFGeneratorService] Error generating CV PDF:', error);
      throw error;
    }
  }

  /**
   * Génère un PDF pour une lettre de motivation
   */
  async generateCoverLetterPDF(letter: CoverLetterContent): Promise<Buffer> {
    try {
      console.log('[PDFGeneratorService] Generating cover letter PDF...');

      // Générer le HTML de la lettre
      const html = generateCoverLetterHTML(letter);

      // Convertir en PDF
      const pdf = await this.generatePDFFromHTML(html);

      console.log('[PDFGeneratorService] Cover letter PDF generated successfully');
      return pdf;
    } catch (error) {
      console.error('[PDFGeneratorService] Error generating cover letter PDF:', error);
      throw error;
    }
  }

  /**
   * Ferme le browser et libère les ressources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        console.log('[PDFGeneratorService] Browser closed successfully');
      } catch (error) {
        console.error('[PDFGeneratorService] Error closing browser:', error);
      }
    }
  }
}

// ============================================================================
// INSTANCE SINGLETON
// ============================================================================

let pdfGeneratorInstance: PDFGeneratorService | null = null;

export function getPDFGenerator(): PDFGeneratorService {
  if (!pdfGeneratorInstance) {
    pdfGeneratorInstance = new PDFGeneratorService();
  }
  return pdfGeneratorInstance;
}

/**
 * Cleanup global - à appeler lors du shutdown de l'application
 */
export async function cleanupPDFGenerator(): Promise<void> {
  if (pdfGeneratorInstance) {
    await pdfGeneratorInstance.cleanup();
    pdfGeneratorInstance = null;
  }
}
