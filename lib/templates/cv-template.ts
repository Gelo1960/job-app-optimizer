import { CVContent } from '@/lib/types';

// ============================================================================
// TEMPLATE CV - ATS-FRIENDLY & PROFESSIONAL
// ============================================================================

/**
 * Génère le HTML d'un CV optimisé pour ATS
 * - Format simple et parsable
 * - Texte sélectionnable
 * - Pas d'images complexes
 * - Structure sémantique claire
 * - Design professionnel mais minimaliste
 */
export function generateCVHTML(cv: CVContent): string {
  const {
    header,
    professionalSummary,
    skills,
    experience,
    projects,
    education,
    additional,
  } = cv;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${header.name} - CV</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      background: #ffffff;
      padding: 20mm 15mm;
    }

    /* Header */
    .header {
      margin-bottom: 20px;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
    }

    .header h1 {
      font-size: 24pt;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }

    .header .title {
      font-size: 13pt;
      color: #4b5563;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .header .contact {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 10pt;
      color: #6b7280;
    }

    .header .contact-item {
      display: inline-block;
    }

    /* Sections */
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 13pt;
      font-weight: 700;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
    }

    /* Summary */
    .summary {
      font-size: 10.5pt;
      line-height: 1.6;
      color: #374151;
      text-align: justify;
    }

    /* Skills */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .skill-category {
      page-break-inside: avoid;
    }

    .skill-category-name {
      font-weight: 700;
      color: #1f2937;
      font-size: 10.5pt;
      margin-bottom: 4px;
    }

    .skill-items {
      font-size: 10pt;
      color: #4b5563;
      line-height: 1.5;
    }

    /* Experience */
    .experience-item {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }

    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }

    .experience-title {
      font-weight: 700;
      font-size: 11pt;
      color: #1f2937;
    }

    .experience-company {
      font-weight: 600;
      font-size: 10.5pt;
      color: #4b5563;
    }

    .experience-period {
      font-size: 9.5pt;
      color: #6b7280;
      font-style: italic;
      white-space: nowrap;
    }

    .experience-bullets {
      list-style-type: disc;
      margin-left: 20px;
      margin-top: 6px;
    }

    .experience-bullets li {
      margin-bottom: 4px;
      font-size: 10pt;
      color: #374151;
      line-height: 1.5;
    }

    /* Projects */
    .project-item {
      margin-bottom: 14px;
      page-break-inside: avoid;
    }

    .project-header {
      margin-bottom: 4px;
    }

    .project-name {
      font-weight: 700;
      font-size: 10.5pt;
      color: #1f2937;
    }

    .project-tech {
      font-size: 9pt;
      color: #6b7280;
      font-style: italic;
      margin-top: 2px;
    }

    .project-description {
      font-size: 10pt;
      color: #374151;
      margin-top: 4px;
      line-height: 1.5;
    }

    .project-highlights {
      list-style-type: circle;
      margin-left: 20px;
      margin-top: 4px;
    }

    .project-highlights li {
      font-size: 9.5pt;
      color: #4b5563;
      margin-bottom: 2px;
    }

    /* Education */
    .education-item {
      margin-bottom: 12px;
      page-break-inside: avoid;
    }

    .education-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .education-degree {
      font-weight: 700;
      font-size: 10.5pt;
      color: #1f2937;
    }

    .education-institution {
      font-size: 10pt;
      color: #4b5563;
    }

    .education-period {
      font-size: 9.5pt;
      color: #6b7280;
      font-style: italic;
    }

    /* Additional */
    .additional-section {
      margin-bottom: 12px;
    }

    .additional-title {
      font-weight: 700;
      font-size: 10pt;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .additional-content {
      font-size: 10pt;
      color: #374151;
    }

    /* Print optimizations */
    @media print {
      body {
        padding: 0;
      }

      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <h1>${escapeHtml(header.name)}</h1>
    <div class="title">${escapeHtml(header.title)}</div>
    <div class="contact">
      ${header.contact.map(item => `<span class="contact-item">${escapeHtml(item)}</span>`).join(' • ')}
    </div>
  </div>

  <!-- PROFESSIONAL SUMMARY -->
  ${professionalSummary ? `
  <div class="section">
    <h2 class="section-title">Profil Professionnel</h2>
    <p class="summary">${escapeHtml(professionalSummary)}</p>
  </div>
  ` : ''}

  <!-- SKILLS -->
  ${skills && skills.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Compétences</h2>
    <div class="skills-grid">
      ${skills.map(skill => `
        <div class="skill-category">
          <div class="skill-category-name">${escapeHtml(skill.category)}</div>
          <div class="skill-items">${skill.items.map(item => escapeHtml(item)).join(' • ')}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- EXPERIENCE -->
  ${experience && experience.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Expérience Professionnelle</h2>
    ${experience.map(exp => `
      <div class="experience-item">
        <div class="experience-header">
          <div>
            <div class="experience-title">${escapeHtml(exp.title)}</div>
            <div class="experience-company">${escapeHtml(exp.company)}</div>
          </div>
          <div class="experience-period">${escapeHtml(exp.period)}</div>
        </div>
        ${exp.bullets && exp.bullets.length > 0 ? `
        <ul class="experience-bullets">
          ${exp.bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('')}
        </ul>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- PROJECTS -->
  ${projects && projects.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Projets Clés</h2>
    ${projects.map(project => `
      <div class="project-item">
        <div class="project-header">
          <div class="project-name">${escapeHtml(project.name)}</div>
          ${project.tech && project.tech.length > 0 ? `
            <div class="project-tech">${project.tech.map(t => escapeHtml(t)).join(', ')}</div>
          ` : ''}
        </div>
        <div class="project-description">${escapeHtml(project.description)}</div>
        ${project.highlights && project.highlights.length > 0 ? `
        <ul class="project-highlights">
          ${project.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
        </ul>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- EDUCATION -->
  ${education && education.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Formation</h2>
    ${education.map(edu => `
      <div class="education-item">
        <div class="education-header">
          <div>
            <div class="education-degree">${escapeHtml(edu.degree)}</div>
            <div class="education-institution">${escapeHtml(edu.institution)}</div>
          </div>
          <div class="education-period">${escapeHtml(edu.period)}</div>
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- ADDITIONAL SECTIONS -->
  ${additional && additional.length > 0 ? additional.map(section => `
    <div class="section">
      <h2 class="section-title">${escapeHtml(section.section)}</h2>
      <div class="additional-content">${escapeHtml(section.content)}</div>
    </div>
  `).join('') : ''}
</body>
</html>
  `.trim();
}

// ============================================================================
// HELPERS
// ============================================================================

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}
