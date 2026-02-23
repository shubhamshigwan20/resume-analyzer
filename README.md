# Resume Match Analyzer (Gemini + Node.js)

A simple AI-powered web app that compares a resume against a job description and returns:
- Match score (`0-100`)
- Missing skills
- Strengths
- Suggested improvements
- Rewritten resume bullet points

It supports both:
- Pasted resume text
- Uploaded PDF resume (parsed on backend using `pdf-parse`)

## Tech Stack
- Node.js
- Express
- Google Gemini API (`@google/genai`)
- Multer (file upload)
- pdf-parse (PDF text extraction)
- Vanilla HTML/CSS/JS frontend served from Express

## Project Structure
```text
backend/
  controllers/
    controllers.js
  public/
    index.html
  routes/
    routes.js
  .env
  package.json
  server.js
```

## Prerequisites
- Node.js 18+ recommended
- Gemini API key from Google AI Studio

## Setup
1. Install dependencies:
```bash
cd backend
npm install
```

2. Create/update `.env`:
```env
PORT=80
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run server:
```bash
npm run dev
```
or
```bash
npm start
```

4. Open app:
```text
http://localhost:80
```

Health check:
```text
GET http://localhost:80/health
```

## Frontend Usage
1. Paste resume text, or upload a PDF resume.
2. Paste job description.
3. Click **Analyze Resume Match**.
4. View structured AI output in the UI.

## API

### `POST /analyze`
Analyze resume content against job description.

Content type:
- `multipart/form-data`

Fields:
- `jobDescription` (string, required)
- `resumeText` (string, optional)
- `resumePdf` (file, optional, PDF only, max 5MB)

Rules:
- `jobDescription` must be present.
- At least one of `resumeText` or `resumePdf` must be provided.
- If both are provided, both are combined for analysis.

#### Sample cURL (text only)
```bash
curl -X POST http://localhost:80/analyze \
  -F "jobDescription=We need a Node.js backend developer with Docker and AWS experience." \
  -F "resumeText=Built REST APIs with Express and MongoDB."
```

#### Sample cURL (PDF upload)
```bash
curl -X POST http://localhost:80/analyze \
  -F "jobDescription=Looking for backend developer with CI/CD and cloud deployment skills." \
  -F "resumePdf=@./resume.pdf;type=application/pdf"
```

#### Success response
```json
{
  "status": true,
  "data": {
    "match_score": 78,
    "missing_skills": ["Docker", "AWS", "CI/CD"],
    "strengths": ["Strong Node.js experience", "REST API development"],
    "improvements": [
      "Quantify achievements",
      "Add cloud deployment experience"
    ],
    "rewritten_bullets": [
      "Developed scalable REST APIs using Node.js and Express serving 10k+ users.",
      "Implemented JWT authentication improving security compliance."
    ]
  }
}
```

#### Error response examples
```json
{
  "status": false,
  "message": "jobDescription is required"
}
```

```json
{
  "status": false,
  "message": "Provide resumeText or upload a resumePdf"
}
```

```json
{
  "status": false,
  "message": "PDF size must be 5MB or less"
}
```

## Notes
- Current AI model in code: `gemini-2.5-flash`.
- Output is requested in structured JSON via Gemini response schema.
- `.env` is gitignored; never commit API keys.

## Troubleshooting
- `Failed to analyze resume`:
  - Verify `GEMINI_API_KEY` is valid.
  - Check server logs for Gemini API errors.
- PDF upload rejected:
  - Ensure file type is PDF.
  - Ensure file size is <= 5MB.
- Port issues:
  - Change `PORT` in `.env` (example: `PORT=3000`).
