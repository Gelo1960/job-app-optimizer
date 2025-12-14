
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { CVContent } from "@/lib/types";

export class DocxService {
    static async generate(content: CVContent): Promise<Buffer> {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        // HEADER
                        new Paragraph({
                            text: content.header.name,
                            heading: HeadingLevel.TITLE,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 120 },
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `${content.header.title} | ${content.header.contact.join(" | ")}`,
                                    size: 22, // 11pt
                                }),
                            ],
                            spacing: { after: 200 },
                            border: {
                                bottom: {
                                    color: "999999",
                                    space: 1,
                                    style: BorderStyle.SINGLE,
                                    size: 6,
                                },
                            },
                        }),

                        // SUMMARY
                        ...this.createSectionHeader("PROFESSIONAL SUMMARY"),
                        new Paragraph({
                            children: [new TextRun({ text: content.professionalSummary, size: 22 })],
                            spacing: { after: 200 },
                        }),

                        // EXPERIENCE
                        ...this.createSectionHeader("EXPERIENCE"),
                        ...content.experience.flatMap((exp) => [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: exp.title, bold: true, size: 24 }),
                                    new TextRun({ text: ` | ${exp.company}`, bold: true, size: 22 }),
                                    new TextRun({ text: `\t${exp.period}`, bold: false, size: 22 }),
                                ],
                                tabStops: [{ type: "right", position: 9000 }], // Right align date
                                spacing: { before: 120, after: 60 },
                            }),
                            ...exp.bullets.map(bullet =>
                                new Paragraph({
                                    text: bullet,
                                    bullet: { level: 0 },
                                    spacing: { after: 40 },
                                })
                            ),
                        ]),

                        // SKILLS
                        ...this.createSectionHeader("SKILLS"),
                        ...content.skills.map((skillGroup) =>
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `${skillGroup.category}: `, bold: true, size: 22 }),
                                    new TextRun({ text: skillGroup.items.join(", "), size: 22 }),
                                ],
                                spacing: { after: 60 },
                            })
                        ),

                        // EDUCATION
                        ...this.createSectionHeader("EDUCATION"),
                        ...content.education.map((edu) =>
                            new Paragraph({
                                children: [
                                    new TextRun({ text: edu.institution, bold: true, size: 22 }),
                                    new TextRun({ text: `\t${edu.period}`, size: 22 }),
                                ],
                                tabStops: [{ type: "right", position: 9000 }],
                                spacing: { after: 40, before: 120 },
                            }),
                        ).flatMap((p, i) => [
                            p,
                            new Paragraph({
                                text: content.education[i].degree,
                                spacing: { after: 40 },
                                indent: { left: 0 } // No indent
                            })
                        ]),
                    ],
                },
            ],
        });

        return await Packer.toBuffer(doc);
    }

    private static createSectionHeader(title: string): Paragraph[] {
        return [
            new Paragraph({
                text: title,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
                border: {
                    bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 }
                }
            }),
        ];
    }
}
