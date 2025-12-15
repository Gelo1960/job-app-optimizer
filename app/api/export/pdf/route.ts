
import { NextRequest, NextResponse } from "next/server";
import { getPDFGenerator } from "@/lib/services/pdf-generator.service";
import { CVContent, CoverLetterContent } from "@/lib/types";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const pdfGenerator = getPDFGenerator();

        let buffer: Buffer;
        let filename: string;

        // Déterminer si c'est un CV ou une lettre selon les champs présents
        if ('letterContent' in body) {
            // C'est une lettre de motivation
            const letterContent = body.letterContent as CoverLetterContent;
            filename = body.filename || 'Lettre_Motivation.pdf';
            buffer = await pdfGenerator.generateCoverLetterPDF(letterContent);
        } else {
            // C'est un CV
            const content = body as CVContent;
            filename = 'cv-custom.pdf';
            buffer = await pdfGenerator.generateCVPDF(content);
        }

        const response = new NextResponse(new Blob([buffer as any]), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });

        return response;
    } catch (error) {
        console.error("PDF Export Error:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}
