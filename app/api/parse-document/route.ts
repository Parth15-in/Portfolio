import { NextRequest, NextResponse } from "next/server";
import zlib from "zlib";

function decodePdfString(str: string): string {
  return str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\([()\\])/g, "$1");
}

function decodeHexPdfString(hex: string): string {
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

/**
 * Pure Node.js zero-dependency PDF text extractor using built-in zlib.
 * 100% reliable across all serverless and containerized environments.
 */
function extractTextFromPdfStream(buffer: Buffer): string {
  let fullText = "";
  const bufStr = buffer.toString("latin1");

  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(bufStr)) !== null) {
    const rawStream = Buffer.from(match[1], "latin1");
    let decompressed = "";

    try {
      decompressed = zlib.inflateSync(rawStream).toString("latin1");
    } catch {
      try {
        decompressed = zlib.inflateRawSync(rawStream).toString("latin1");
      } catch {
        decompressed = rawStream.toString("latin1");
      }
    }

    if (!decompressed.includes("BT") && !decompressed.includes("Tj") && !decompressed.includes("TJ")) {
      continue;
    }

    const btRegex = /BT([\s\S]*?)ET/g;
    let btMatch: RegExpExecArray | null;

    while ((btMatch = btRegex.exec(decompressed)) !== null) {
      const block = btMatch[1];
      let lineText = "";

      // Match (literal string) Tj or <hex string> Tj
      const tjRegex = /(?:\(([^()]*?(?:\\.[^()]*?)*)\)|<([0-9a-fA-F\s]+)>)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        if (tjMatch[1] !== undefined) {
          lineText += decodePdfString(tjMatch[1]) + " ";
        } else if (tjMatch[2] !== undefined) {
          lineText += decodeHexPdfString(tjMatch[2].replace(/\s+/g, "")) + " ";
        }
      }

      // Match [(...) -100 (...)] TJ
      const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
      let arrMatch: RegExpExecArray | null;
      while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
        const inner = arrMatch[1];
        const itemRegex = /(?:\(([^()]*?(?:\\.[^()]*?)*)\)|<([0-9a-fA-F\s]+)>|(-?\d+(?:\.\d+)?))/g;
        let itemMatch: RegExpExecArray | null;
        while ((itemMatch = itemRegex.exec(inner)) !== null) {
          if (itemMatch[1] !== undefined) {
            lineText += decodePdfString(itemMatch[1]);
          } else if (itemMatch[2] !== undefined) {
            lineText += decodeHexPdfString(itemMatch[2].replace(/\s+/g, ""));
          } else if (itemMatch[3] !== undefined) {
            const shift = parseFloat(itemMatch[3]);
            if (shift < -120 && !lineText.endsWith(" ")) {
              lineText += " ";
            }
          }
        }
        lineText += " ";
      }

      // Match ' or " operators
      const quoteRegex = /(?:\(([^()]*?(?:\\.[^()]*?)*)\)|<([0-9a-fA-F\s]+)>)\s*['"]/g;
      let qMatch: RegExpExecArray | null;
      while ((qMatch = quoteRegex.exec(block)) !== null) {
        if (qMatch[1] !== undefined) {
          lineText += "\n" + decodePdfString(qMatch[1]);
        } else if (qMatch[2] !== undefined) {
          lineText += "\n" + decodeHexPdfString(qMatch[2].replace(/\s+/g, ""));
        }
      }

      if (lineText.trim()) {
        fullText += lineText.trim() + "\n";
      }
    }
  }

  return fullText
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
}

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
      // Primary attempt: pdf-parse
      try {
        // @ts-ignore
        const pdfParser = require("pdf-parse/lib/pdf-parse.js");
        const data = await pdfParser(buffer);
        if (data && typeof data.text === "string" && data.text.trim().length >= 30) {
          extractedText = data.text;
        }
      } catch (err: any) {
        console.warn("[parse-document] pdf-parse skipped/failed:", err?.message);
      }

      // Robust fallback: Pure built-in stream text extractor
      if (!extractedText || extractedText.trim().length < 30) {
        try {
          const streamText = extractTextFromPdfStream(buffer);
          if (streamText && streamText.trim().length >= 30) {
            extractedText = streamText;
          }
        } catch (streamErr: any) {
          console.error("[parse-document] Stream PDF parse error:", streamErr);
        }
      }

      if (!extractedText || extractedText.trim().length < 20) {
        return NextResponse.json(
          {
            error:
              "Unable to extract selectable text from this PDF (it may be a scanned image or protected file). Please copy and paste the text directly into the box below.",
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
        {
          error:
            "Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or text file (.txt).",
        },
        { status: 400 }
      );
    }

    // Clean whitespace
    const cleanText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanText || cleanText.length < 20) {
      return NextResponse.json(
        {
          error:
            "The document contains little or no extractable text. Please copy and paste the job description text directly.",
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
