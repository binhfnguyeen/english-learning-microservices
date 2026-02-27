"use server"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface Choice {
    id: number;
    isCorrect: boolean;
    vocabularyId: number;
    word: string;
}

interface QuestionInput {
    id: number;
    content: string;
    choices: Choice[];
}

interface QuestionExplanation {
    questionId: number;
    explanation: string;
    relatedWords: string[];
}

export async function POST(req: Request) {
    try {
        const { questions } = await req.json() as { questions: QuestionInput[] };
        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Bạn là giáo viên tiếng Anh. Với mỗi câu hỏi và đáp án đúng dưới đây,
            hãy giải thích tại sao đáp án đúng, nghĩa của từ, và mở rộng thêm 2-3 từ liên quan.
            Chỉ trả về **JSON hợp lệ**, không thêm văn bản, không giải thích, không dùng markdown hay dấu \`\`\`.

            Dữ liệu:
            ${JSON.stringify(questions)}

            Kết quả mẫu:
            [
                {
                    "questionId": 1,
                    "explanation": "Giải thích...",
                    "relatedWords": ["từ1", "từ2"]
                }
            ]
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        
        console.log("Gemini raw output:", text);

        let cleanedText = text.trim();

        console.log("Text after clean: ", cleanedText);

        if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/```json\s*|```/g, "").trim();
        }


        let parsed: QuestionExplanation[];
        try {
            parsed = JSON.parse(cleanedText);
        } catch (err) {
            console.error("JSON parse error:", err);
            return NextResponse.json({
                error: "Invalid JSON from Gemini",
                raw: text
            }, { status: 500 });
        }

        return NextResponse.json(parsed);
    } catch (err) {
        console.error("Gemini API error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}