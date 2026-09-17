import mammoth from 'mammoth';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const isESM = typeof import.meta !== 'undefined' && import.meta.url;
const req = isESM ? createRequire(import.meta.url) : (typeof require !== 'undefined' ? require : createRequire(fileURLToPath('file://' + __filename)));
const pdfParse = req('pdf-parse');

export interface ParsedDocumentResult {
  text: string;
  wordCount: number;
  tokensEstimate: number;
  pages?: number;
}

export async function parseDocumentBuffer(
  buffer: Buffer, 
  filename: string, 
  mimetype?: string
): Promise<ParsedDocumentResult> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  let extractedText = '';
  let pages: number | undefined;

  try {
    if (ext === 'pdf' || mimetype?.includes('pdf')) {
      const parseFunc = (pdfParse as any).default || pdfParse;
      const data = await parseFunc(buffer);
      extractedText = data.text || '';
      pages = data.numpages;
    } else if (ext === 'docx' || mimetype?.includes('wordprocessingml')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else if (ext === 'doc') {
      // DOC (legacy binary) might have partial text or throw; fallback to raw string filtering
      const raw = buffer.toString('binary');
      const printable = raw.replace(/[^\x20-\x7E\n\r\t\u00A0-\u00FF]/g, ' ');
      extractedText = printable.replace(/\s+/g, ' ').trim();
    } else {
      // txt, md, csv, json, html, rtf
      extractedText = buffer.toString('utf-8');
    }
  } catch (error: any) {
    console.error(`Erro ao extrair texto do documento ${filename}:`, error);
    // Fallback: attempt basic utf8 text extraction
    extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t\u00A0-\u00FF]/g, ' ').trim();
  }

  // Clean and normalize text
  const cleanedText = extractedText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const words = cleanedText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const tokensEstimate = Math.round(cleanedText.length / 4);

  return {
    text: cleanedText,
    wordCount,
    tokensEstimate,
    pages
  };
}
