const pdfParse = require("pdf-parse");

const healthStatus = (req, res) => {
  return res.status(200).json({
    status: true,
    timestamp: new Date().toLocaleString(),
  });
};

const analyzeResume = async (req, res) => {
  try {
    const { resumeText = "", jobDescription = "" } = req.body;
    const trimmedJobDescription = jobDescription.trim();
    const trimmedResumeText = resumeText.trim();
    const uploadedPdf = req.file;

    if (!trimmedJobDescription) {
      return res.status(400).json({
        status: false,
        message: "jobDescription is required",
      });
    }

    let finalResumeText = trimmedResumeText;

    if (uploadedPdf) {
      const parsedPdf = await pdfParse(uploadedPdf.buffer);
      finalResumeText = `${trimmedResumeText}\n${parsedPdf.text || ""}`.trim();
    }

    if (!finalResumeText) {
      return res.status(400).json({
        status: false,
        message: "Provide resumeText or upload a resumePdf",
      });
    }

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
Analyze this resume against the job description.

Resume:
${finalResumeText}

Job Description:
${trimmedJobDescription}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            match_score: { type: "integer", minimum: 0, maximum: 100 },
            missing_skills: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            rewritten_bullets: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 3,
            },
          },
          required: [
            "match_score",
            "missing_skills",
            "strengths",
            "improvements",
            "rewritten_bullets",
          ],
        },
      },
    });

    const result = JSON.parse(response.text);

    return res.status(200).json({
      status: true,
      data: result,
    });
  } catch (error) {
    console.error("Gemini analyze error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
};

module.exports = { healthStatus, analyzeResume };
