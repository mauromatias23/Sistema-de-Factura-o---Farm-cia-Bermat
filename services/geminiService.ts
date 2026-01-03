
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Invoice, Batch } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const auditSalesData = async (invoices: Invoice[], products: Product[], batches: Batch[]) => {
  const context = `
    Invoices: ${JSON.stringify(invoices.slice(0, 10))}
    Products: ${JSON.stringify(products.slice(0, 10))}
    Batches: ${JSON.stringify(batches.slice(0, 10))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze this pharmaceutical sales data and provide:
        1. A summary of top performing products.
        2. Any anomalies or risks (e.g., selling near expiry).
        3. Strategic advice for inventory management.
        Output in clear Portuguese.
        Data: ${context}
      `,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    return "Erro ao processar auditoria inteligente.";
  }
};
