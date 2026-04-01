import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAZWOrC96CRNNMYpPqTwQGR0JmwdpDjSfE"; 
const genAI = new GoogleGenerativeAI(API_KEY);

export async function parseSearchWithAI(query: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      أنت مساعد ذكي لمنصة "Dar DARK" للعقارات بالمغرب.
      حول طلب الزبون بالدارجة إلى JSON دقيق للفلاتر.
      الجملة: "${query}"

      الرد JSON فقط:
      {
        "propertyType": "شقة" | "فيلا" | "منزل" | null,
        "district": "اسم الحي" | null,
        "city": "سيدي علال البحراوي",
        "minPriceDh": رقم (مثلا 400000) | null,
        "maxPriceDh": رقم | null,
        "supportDh": 100000 | 70000 | 0 | "any" | null,
        "aiExplanation": "جملة بالدارجة لشنو فهمتي"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
}
