import { CVContent } from '../types';

/**
 * Utilitaires pour le formatting de CV (fonctions pures, sans appels API)
 */
export class CVFormatterUtils {
    /**
     * Convertit le CVContent en texte brut (pour preview ou export texte)
     */
    static cvContentToText(cv: CVContent): string {
        let text = '';

        // Header
        text += `${cv.header.name}\\n`;
        text += `${cv.header.title}\\n`;
        text += `${cv.header.contact.join(' | ')}\\n\\n`;

        // Professional Summary
        text += `PROFIL PROFESSIONNEL\\n`;
        text += `${cv.professionalSummary}\\n\\n`;

        // Skills
        text += `COMPÉTENCES\\n`;
        cv.skills.forEach((skillGroup) => {
            text += `${skillGroup.category}: ${skillGroup.items.join(', ')}\\n`;
        });
        text += `\\n`;

        // Experience
        text += `EXPÉRIENCE PROFESSIONNELLE\\n`;
        cv.experience.forEach((exp) => {
            text += `${exp.title} - ${exp.company} (${exp.period})\\n`;
            exp.bullets.forEach((bullet) => {
                text += `• ${bullet}\\n`;
            });
            text += `\\n`;
        });

        // Projects (if any)
        if (cv.projects && cv.projects.length > 0) {
            text += `PROJETS\\n`;
            cv.projects.forEach((project) => {
                text += `${project.name}\\n`;
                text += `${project.description}\\n`;
                text += `Technologies: ${project.tech.join(', ')}\\n`;
                project.highlights.forEach((highlight) => {
                    text += `• ${highlight}\\n`;
                });
                text += `\\n`;
            });
        }

        // Education
        text += `FORMATION\\n`;
        cv.education.forEach((edu) => {
            text += `${edu.degree} - ${edu.institution} (${edu.period})\\n`;
        });

        // Additional
        if (cv.additional) {
            cv.additional.forEach((section) => {
                text += `\\n${section.section}\\n`;
                text += `${section.content}\\n`;
            });
        }

        return text;
    }
}
