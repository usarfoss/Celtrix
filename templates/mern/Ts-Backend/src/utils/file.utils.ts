import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { env } from '../constant/env.constant';
import * as XLSX from 'xlsx';
import pdfParse from 'pdf-parse';
import { Request } from 'express';

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext).replace(/\s+/g, '_');
  return `${name}_${timestamp}_${random}${ext}`;
}

export function getFolderForMime(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (
    mimeType === 'application/pdf' ||
    mimeType === 'text/plain' ||
    mimeType === 'application/msword' ||
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return 'documents';
  return 'others';
}

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
ensureDir(uploadRoot);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getFolderForMime(file.mimetype);
    const targetDir = path.join(uploadRoot, folder);
    ensureDir(targetDir);
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFileName(file.originalname));
  },
});

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const allowed = [
    'image/',
    'video/',
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowed.some((a) => (a.endsWith('/') ? file.mimetype.startsWith(a) : file.mimetype === a))) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: parseSize(env.MAX_FILE_SIZE) },
  fileFilter,
});

export function parseSize(size: string): number {
  const match = size.match(/^(\d+)([kmgt]?b)$/i);
  if (!match) return 10 * 1024 * 1024;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const map: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
  };
  return value * (map[unit] || 1);
}

export async function readXlsx(filePath: string): Promise<any[]> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: null });
}

export async function readPdfText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}


