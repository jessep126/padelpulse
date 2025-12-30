
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PadelLocation, Tournament } from "../types";

export class PadelAIService {
  constructor() {}

  // Fix: Use process.env.API_KEY directly as per initialization guidelines
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async analyzeMatchFrame(base64Image: string, currentScore: string, courtEnd: string = "Side A") {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `You are an expert World Padel Tour referee and commentator. 
                   Current camera position: Looking from the back glass of ${courtEnd}.
                   Score: ${currentScore}.
                   Analyze this action. Use technical padel terms if appropriate (e.g., Bandeja, Vibora, Chiquita, Bajada, Por Tres, Por Cuatro smash).
                   Return a JSON object with: { description: string, winner: "Team A" | "Team B" | "none", isHighlight: boolean }` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            winner: { type: Type.STRING, enum: ["Team A", "Team B", "none"] },
            isHighlight: { type: Type.BOOLEAN }
          },
          required: ["description", "winner", "isHighlight"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async composeEmail(type: 'welcome' | 'challenge' | 'invite', data: any) {
    const ai = this.getClient();
    const prompt = `Compose a professional, high-energy Padel-themed communication for the following scenario:
      Type: ${type}
      Recipient Name: ${data.name}
      ${type === 'welcome' ? `Context: New user joining PadelPulse AI. Verification Code: ${data.code}` : ''}
      ${type === 'challenge' ? `Context: Challenged to a match by ${data.sender}.` : ''}
      ${type === 'invite' ? `Context: Invited to join league ${data.leagueName} by ${data.sender}.` : ''}
      
      Return a JSON object with: 
      { 
        subject: string, 
        body: string (formatted with newlines),
        share_text: string (shorter, high-energy version with emojis for WhatsApp/iMessage)
      }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
            share_text: { type: Type.STRING }
          },
          required: ["subject", "body", "share_text"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async generateSpeech(text: string): Promise<string | undefined> {
    try {
      // Fix: Use getClient to ensure API_KEY is provided
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say this like a high-energy padel commentator: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' },
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
      console.error("TTS failed", e);
      throw e;
    }
  }

  async findNearbyCourts(lat: number, lng: number): Promise<PadelLocation[]> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find Padel clubs, indoor/outdoor courts, and sports centers near these coordinates.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks
      .filter((c: any) => c.maps)
      .map((c: any) => ({
        name: c.maps.title,
        address: c.maps.address || "Padel Club",
        uri: c.maps.uri
      }));
  }

  async findUpcomingTournaments(location: string): Promise<Tournament[]> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for official Padel tournaments (FIP, Premier Padel, or local amateur opens) in ${location} for the next 12 months.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title,
        date: "See Event Details",
        location: location,
        link: c.web.uri
      }));
  }
}

export const padelAI = new PadelAIService();
