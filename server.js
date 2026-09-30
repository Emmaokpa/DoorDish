import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('*', (req, res, next) => {
  if (req.accepts('html')) {
    const filePath = path.join(__dirname, req.path);
    if (!path.extname(req.path)) {
      return res.sendFile(`${filePath}.html`, (err) => {
        if (err) {
          res.sendFile(path.join(__dirname, 'index.html'));
        }
      });
    }
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DoorDish server running on http://0.0.0.0:${PORT}`);
});
