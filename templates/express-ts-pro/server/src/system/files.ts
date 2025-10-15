import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import pdfParse from 'pdf-parse';

export const router = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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
      const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
      const first = wb.SheetNames[0];
      const rows = xlsx.utils.sheet_to_json(wb.Sheets[first], { header: 1 });
      return res.json({ type: 'xlsx', rows });
    }
    return res.status(415).json({ error: 'Unsupported file type' });
  } catch (e) {
    next(e);
  }
});


