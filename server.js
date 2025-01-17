const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('file');

// Check File Type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|pdf/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images and PDFs Only!');
  }
}

// Create uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) {
  console.log('Creating uploads folder...');
  fs.mkdirSync('./uploads');
} else {
  console.log('Uploads folder already exists.');
}

// Routes
app.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400).json({ error: err });
    } else {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
      } else {
        try {
          let extractedText = '';
          
          if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
          } else {
            const { data: { text } } = await Tesseract.recognize(
              req.file.path,
              'eng'
            );
            extractedText = text;
          }

          // Simple analysis
          const analysis = analyzeContent(extractedText);
          
          res.json({
            message: 'File uploaded successfully',
            analysis: analysis
          });
        } catch (error) {
          res.status(500).json({ error: 'Error processing file' });
        }
      }
    }
  });
});

function analyzeContent(text) {
  // Simple analysis logic
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;
  
  const analysis = {
    statistics: {
      wordCount: words,
      sentenceCount: sentences,
      averageWordsPerSentence: avgWordsPerSentence.toFixed(1)
    },
    engagementScore: calculateEngagementScore(text),
    suggestions: generateSuggestions(text)
  };
  
  return analysis;
}

function calculateEngagementScore(text) {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;
  
  // Simple scoring algorithm
  let score = 100;
  
  // Penalize if too wordy or too brief
  if (avgWordsPerSentence > 25) score -= 20;
  if (avgWordsPerSentence < 10) score -= 10;
  
  // Penalize if too short or too long
  if (words < 100) score -= 20;
  if (words > 1000) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function generateSuggestions(text) {
  const suggestions = [];
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  
  if (words < 100) {
    suggestions.push('Consider adding more content for better engagement');
  }
  
  if (words / sentences > 25) {
    suggestions.push('Try breaking down some longer sentences for better readability');
  }
  
  if (!text.includes('?')) {
    suggestions.push('Add questions to encourage user interaction');
  }
  
  return suggestions;
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));