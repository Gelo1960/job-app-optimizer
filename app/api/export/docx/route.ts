
import { NextRequest, NextResponse } from "next/server";
import { DocxService } from "@/lib/services/docx.service";
import { CVContent } from "@/lib/types";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const content = body as CVContent;

        const buffer = await DocxService.generate(content);

        // Create response with correct headers for download
        const response = new NextResponse(new Blob([buffer as any]), {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename="cv-custom.docx"`,
            },
        });

        return response;
    } catch (error) {
        console.error("DOCX Export Error:", error);
        return NextResponse.json(
            { error: "Failed to generate DOCX" },
            { status: 500 }
        );
    }
}
