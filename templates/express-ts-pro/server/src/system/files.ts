import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import pdfParse from 'pdf-parse';

export const router = Router();

const diskStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const mime = file.mimetype;
    let folder = 'documents';
    if (mime.startsWith('image/')) folder = 'images';
    else if (mime.startsWith('video/')) folder = 'videos';
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage: diskStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/parse', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required' });
    const mime = req.file.mimetype;
    if (mime === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      return res.json({ type: 'pdf', text: data.text.slice(0, 5000) });
    }
    if (
      mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mime === 'application/vnd.ms-excel' ||
      mime === 'application/octet-stream'
    ) {
      const wb = xlsx.readFile(req.file.path);
      const first = wb.SheetNames[0];
      const rows = xlsx.utils.sheet_to_json(wb.Sheets[first], { header: 1 });
      return res.json({ type: 'xlsx', rows });
    }
    return res.status(415).json({ error: 'Unsupported file type' });
  } catch (e) {
    next(e);
  }
});


