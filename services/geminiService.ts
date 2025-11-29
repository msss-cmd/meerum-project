import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PaperMetadata, SummaryData, SimilarPaper, EvaluationData } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

// 1. Extract Metadata (Title/Abstract) if strictly needed, or just use the full text for everything.
// We will try to infer title and abstract from the first chunk of text to be efficient.
export const extractMetadata = async (text: string): Promise<Omit<PaperMetadata, 'text'>> => {
  const ai = getAIClient();
  const firstChunk = text.slice(0, 15000); // Usually title/abstract are in the first few pages

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Extract the Title and Abstract from the following academic paper text. 
    
    Text: ${firstChunk}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          abstract: { type: Type.STRING }
        },
        required: ["title", "abstract"]
      }
    }
  });

  const json = JSON.parse(response.text || '{}');
  return {
    title: json.title || "Unknown Title",
    abstract: json.abstract || "No abstract found."
  };
};

// 2. Summarize Paper
export const summarizePaper = async (text: string): Promise<SummaryData> => {
  const ai = getAIClient();
  
  // Gemini 2.5 Flash has a huge context window, so we can often send the whole text.
  // However, for very large papers, we might want to truncate or just send the first 50k chars 
  // if we are worried about latency, but let's try full text (up to reasonable limit).
  const safeText = text.slice(0, 100000); 

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      mainSummary: { type: Type.STRING, description: "A 150-200 word concise overview." },
      contributions: { type: Type.ARRAY, items: { type: Type.STRING } },
      method: { type: Type.ARRAY, items: { type: Type.STRING } },
      results: { type: Type.ARRAY, items: { type: Type.STRING } },
      limitations: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["mainSummary", "contributions", "method", "results"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `You are an expert academic researcher. Analyze the following research paper text and provide a structured summary.
    
    Paper Text:
    ${safeText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(response.text || '{}');
};

// 3. Find Similar Papers (Using Google Search Grounding)
export const findSimilarPapers = async (title: string, abstract: string): Promise<SimilarPaper[]> => {
  const ai = getAIClient();

  const prompt = `Find 5 distinct, real academic research papers that are semantically similar to the paper titled "${title}" with the following abstract: "${abstract}".
  
  For each paper found, provide the title, and a brief snippet describing why it is similar.
  Focus on papers from reputable sources like Semantic Scholar, arXiv, IEEE, ACM, or Nature.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  // Extract grounding chunks which contain the actual URLs found by Google Search
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const papers: SimilarPaper[] = [];

  // Parse the text to associate titles with chunks if possible, 
  // but for simplicity in this demo, we will map valid grounding chunks to a structured format
  // or use the text to extract the titles and match them.
  // A robust way: Ask Gemini to format the found information as JSON *after* the tool use, 
  // but we can't chain easily in one go with search tool + json mode consistently.
  // Instead, we will process the grounding chunks directly.
  
  chunks.forEach((chunk) => {
    if (chunk.web?.uri && chunk.web?.title) {
        // Filter out generic search pages
        if (!chunk.web.uri.includes('google.com/search')) {
            papers.push({
                title: chunk.web.title,
                url: chunk.web.uri,
                source: new URL(chunk.web.uri).hostname.replace('www.', ''),
            });
        }
    }
  });

  // Deduplicate by URL
  const uniquePapers = Array.from(new Map(papers.map(p => [p.url, p])).values()).slice(0, 5);
  return uniquePapers;
};

// 4. Evaluate Summary
export const evaluateSummary = async (originalText: string, summary: SummaryData): Promise<EvaluationData> => {
  const ai = getAIClient();
  
  // Use a portion of the original text for comparison to save tokens/latency
  const comparisonText = originalText.slice(0, 30000);
  const summaryText = `${summary.mainSummary}\n\nContributions: ${summary.contributions.join(', ')}`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "Overall faithfulness score 0-100" },
      semanticSimilarityScore: { type: Type.NUMBER, description: "0-100 score based on semantic meaning preservation" },
      keypointCoverageScore: { type: Type.NUMBER, description: "0-100 score based on coverage of key contributions" },
      reasoning: { type: Type.STRING, description: "Explanation of the score" },
      missingKeypoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key points from original text missed in summary" }
    },
    required: ["score", "semanticSimilarityScore", "keypointCoverageScore", "reasoning", "missingKeypoints"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `You are an impartial judge evaluating the quality of an AI-generated summary of a research paper.
    
    Original Paper Text (Truncated):
    ${comparisonText}
    
    Generated Summary:
    ${summaryText}
    
    Task:
    1. Identify key contributions in the Original Text.
    2. Check if the Generated Summary covers these points.
    3. Evaluate if the semantic meaning is preserved without hallucinations.
    4. Provide scores (0-100).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(response.text || '{}');
};