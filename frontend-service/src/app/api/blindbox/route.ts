import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    isActive: boolean;
    avatar: string;
    role: string;
}

interface Progress {
    userId: User;
    daysStudied: number;
    wordsLearned: number;
    level: string;
}

interface Word {
    id: number;
    word: string;
    meaning: string;
}

export async function POST(req: Request) {
    try {
        const { progress } = await req.json() as { progress: Progress };
        if (!progress) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Bạn là giáo viên tiếng Anh. Với tiến độ học tập gồm số ngày đã học, số từ đã học và trình độ,
            hãy gợi ý ngẫu nhiên 15 từ tiếng Anh phù hợp với trình độ của học viên mức thấp nhất là B1. 
            Mỗi lần gợi ý nên có sự đa dạng, tránh lặp lại y hệt những từ đã đề xuất trước đó. 
            Với meaning là nghĩa tiếng Việt. 

            Chỉ trả về **JSON hợp lệ**, không thêm văn bản, không giải thích, không dùng markdown hay dấu \`\`\`.

            Dữ liệu:
            ${JSON.stringify(progress)}

            Kết quả mẫu:
            [
                {
                    "id": 1,
                    "word": "Từ",
                    "meaning": "Nghĩa của từ",
                    "example": "Ví dụ về từ"
                },
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

        let parsed: Word[];
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