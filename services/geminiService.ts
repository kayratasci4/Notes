import { GoogleGenAI } from "@google/genai";
import { AIActionType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

export const generateNoteContent = async (
  currentContent: string,
  action: AIActionType,
  currentTitle?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Anahtarı eksik (API Key missing).");
  }

  let prompt = "";

  switch (action) {
    case AIActionType.SUMMARIZE:
      prompt = `Aşağıdaki metni Türkçe olarak özetle. Kısa ve öz tut:\n\n"${currentContent}"`;
      break;
    case AIActionType.FIX_GRAMMAR:
      prompt = `Aşağıdaki metindeki dilbilgisi ve yazım hatalarını düzelt. Sadece düzeltilmiş metni döndür, başka açıklama ekleme:\n\n"${currentContent}"`;
      break;
    case AIActionType.CONTINUE_WRITING:
      prompt = `Aşağıdaki metni mantıklı bir şekilde devam ettir (Türkçe). Bir paragraf ekle:\n\n"${currentContent}"`;
      break;
    case AIActionType.MAKE_LONGER:
      prompt = `Aşağıdaki metni daha detaylı ve açıklayıcı hale getirerek genişlet (Türkçe):\n\n"${currentContent}"`;
      break;
    case AIActionType.GENERATE_TITLE:
      prompt = `Aşağıdaki not içeriği için kısa, ilgi çekici ve özetleyici bir başlık oluştur (maksimum 6 kelime, sadece başlığı yaz, tırnak işareti kullanma):\n\n"${currentContent}"`;
      break;
    default:
      return currentContent;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error("AI boş yanıt döndürdü.");
    
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.");
  }
};