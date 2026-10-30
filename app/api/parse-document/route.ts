import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit. Please upload a smaller document." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = "";

    // 1. PDF parsing
    if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
      try {
        // Direct require of pdf-parse implementation bypasses index.js test file auto-run bug
        // @ts-ignore
        const pdfParser = require("pdf-parse/lib/pdf-parse.js");
        const data = await pdfParser(buffer);
        extractedText = data.text || "";
      } catch (err: any) {
        console.error("[parse-document] PDF parse error:", err);
        return NextResponse.json(
          {
            error:
              "Unable to read text from this PDF. Please verify it contains selectable text, or copy-paste the text directly.",
          },
          { status: 400 }
        );
      }
    }
    // 2. DOCX parsing
    else if (
      fileName.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        // @ts-ignore
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (err: any) {
        console.error("[parse-document] DOCX parse error:", err);
        return NextResponse.json(
          { error: "Failed to extract text from Word document (.docx)." },
          { status: 400 }
        );
      }
    }
    // 3. Plain text / Markdown
    else if (
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md") ||
      file.type.startsWith("text/")
    ) {
      extractedText = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF (.pdf), Word document (.docx), or text file (.txt)." },
        { status: 400 }
      );
    }

    // Clean whitespace
    const cleanText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanText || cleanText.length < 30) {
      return NextResponse.json(
        {
          error:
            "The document contains little or no extractable text (it may be a scanned image). Please copy and paste the job description text directly.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: cleanText,
      fileName: file.name,
      characterCount: cleanText.length,
    });
  } catch (error: any) {
    console.error("[API /api/parse-document] Unhandled error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process document." },
      { status: 500 }
    );
  }
}
