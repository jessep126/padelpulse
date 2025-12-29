
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PadelLocation, Tournament } from "../types";

export class PadelAIService {
  // We no longer store ai in the constructor to avoid top-level process.env access
  constructor() {}

  async analyzeMatchFrame(base64Image: string, currentScore: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Analyze this Padel match frame. Current score is ${currentScore}. 
                   Describe the action in one short sentence. 
                   Identify if this looks like a winning point or an amazing save (highlight worthy).
                   If a point was clearly won, suggest which team won it (Team A or Team B).
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

  async generateSpeech(text: string): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say naturally but like a sports commentator: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' }, // Energetic voice
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
      console.error("TTS failed", e);
      return undefined;
    }
  }

  async findNearbyCourts(lat: number, lng: number): Promise<PadelLocation[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find Padel courts and clubs near these coordinates.",
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
        address: c.maps.address || "Check map for details",
        uri: c.maps.uri
      }));
  }

  async findUpcomingTournaments(location: string): Promise<Tournament[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for upcoming Padel tournaments in or near ${location} for 2024 and 2025.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title,
        date: "Upcoming",
        location: location,
        link: c.web.uri
      }));
  }
}

export const padelAI = new PadelAIService();
