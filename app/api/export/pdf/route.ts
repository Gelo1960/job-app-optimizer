
import { NextRequest, NextResponse } from "next/server";
import { PdfService } from "@/lib/services/pdf.service";
import { CVContent } from "@/lib/types";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const content = body as CVContent;

        const buffer = await PdfService.generate(content);

        const response = new NextResponse(new Blob([buffer as any]), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="cv-custom.pdf"`,
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
