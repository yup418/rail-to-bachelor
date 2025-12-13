const fs = require('fs');
const pdf = require('pdf-parse');
console.log('PDF PARSE IMPORT:', pdf);
const path = require('path');

async function parsePDF(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    // Try to handle ESM default export if it exists
    const pdfFunc = pdf.default || pdf;
    const data = await pdfFunc(dataBuffer);

    // Extract text
    const text = data.text;
    console.log("RAW TEXT START:", text.substring(0, 500));

    // Simple parsing logic (can be improved with LLM later)
    // We try to split by question numbers like "1.", "2.", etc.
    // This is a naive implementation to demonstrate the flow.
    const questions = [];

    // Split by lines first
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

    let currentQuestion = null;

    // Regex for question start, e.g., "1.", "2．", "10.", "1、"
    const questionStartRegex = /^(\d+)[ \.．、]/;

    // Regex for options, e.g., "A.", "B．", "(A)"
    const optionStartRegex = /^[\(（]?[A-D][\)）]?[ \.．、]/;

    for (const line of lines) {
        const match = line.match(questionStartRegex);
        if (match) {
            // New question found
            if (currentQuestion) {
                questions.push(currentQuestion);
            }

            currentQuestion = {
                id: match[1],
                content: line, // Start content
                type: 'CHOICE', // Assume choice for now, detect logic needed
                options: [],
                answer: '', // Extracted answer if available, usually at end of paper
                explanation: ''
            };
        } else if (currentQuestion) {
            // Append to current question or parse options
            if (optionStartRegex.test(line.trim())) {
                currentQuestion.options.push(line.trim());
            } else {
                // Check if it's answer section (naive check)
                if (line.includes('参考答案') || line.includes('Answer')) {
                    // Stop parsing or switch mode (not implemented for simple demo)
                } else {
                    currentQuestion.content += '\n' + line;
                }
            }
        }
    }

    if (currentQuestion) {
        questions.push(currentQuestion);
    }

    return questions;
}

// Main execution
const pdfPath = '/Users/yup/Desktop/yuxin/mock_exam.pdf';
parsePDF(pdfPath).then(questions => {
    // Check if text is extremely short, imply it might be scanned
    if (questions.length === 0) {
        console.log("No questions found (or text is empty).");
    }
    console.log(JSON.stringify(questions.slice(0, 2), null, 2)); // Log first 2 questions
}).catch(err => {
    console.error("Error parsing PDF:", err);
});
