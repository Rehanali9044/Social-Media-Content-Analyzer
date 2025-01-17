# Social-Media-Content-Analyzer

A web application that analyzes social media content from PDFs and images, providing engagement insights and improvement suggestions.
Quick Setup

Create project folder and install dependencies:

bashCopymkdir social-media-analyzer
cd social-media-analyzer
npm init -y
npm install express multer pdf-parse tesseract.js nodemon

Create folders and files:

Copysocial-media-analyzer/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── index.html
└── server.js

Start server:

bashCopynpm run dev
Features

File upload: PDF, PNG, JPG, JPEG
Text extraction from documents and images
Content analysis with engagement score
Improvement suggestions
Drag & drop interface

Technical Stack

Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express.js
Libraries: pdf-parse (PDF), Tesseract.js (OCR)

Visit http://localhost:3000 to use the application.
Note
The uploads folder is created automatically when the server starts. Maximum file size: 10MB.
