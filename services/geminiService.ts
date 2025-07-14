
import { GoogleGenAI, Type } from "@google/genai";
import { StructuredReport, Customer, InterventionReport, Appointment } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY non trovata. Assicurati che la variabile d'ambiente process.env.API_KEY sia impostata.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    problemDescription: {
      type: Type.STRING,
      description: "Descrizione chiara e concisa del problema segnalato dal cliente o riscontrato dal tecnico. Usare un linguaggio formale e tecnico.",
    },
    actionsTaken: {
      type: Type.STRING,
      description: "Descrizione dettagliata e sequenziale delle operazioni tecniche eseguite per analizzare e risolvere il problema. Elencare i passaggi in modo ordinato.",
    },
    materialsUsed: {
      type: Type.ARRAY,
      description: "Elenco dei materiali, componenti o pezzi di ricambio utilizzati durante l'intervento. Se non è stato usato nulla, restituire un array vuoto.",
      items: {
        type: Type.STRING,
      },
    },
    conclusion: {
      type: Type.STRING,
      description: "Conclusione dell'intervento, indicando lo stato finale dell'apparecchiatura/sistema, l'esito (es. problema risolto, intervento palliativo) ed eventuali raccomandazioni per il cliente.",
    },
  },
  required: ["problemDescription", "actionsTaken", "materialsUsed", "conclusion"],
};

export const generateStructuredReport = async (prompt: string): Promise<StructuredReport> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Trasforma le seguenti informazioni di un intervento tecnico in un rapporto strutturato e professionale.\n\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("La risposta dell'API era vuota.");
    }

    const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
    const structuredData: StructuredReport = JSON.parse(cleanedJsonText);
    return structuredData;

  } catch (error) {
    console.error("Errore durante la generazione del report con Gemini:", error);
    throw new Error("Impossibile generare il report strutturato. Riprova più tardi.");
  }
};

const searchSchema = {
    type: Type.OBJECT,
    properties: {
        customerIds: {
            type: Type.ARRAY,
            description: "Un array di ID cliente che corrispondono alla query.",
            items: { type: Type.STRING }
        },
        reportIds: {
            type: Type.ARRAY,
            description: "Un array di ID rapportino che corrispondono alla query.",
            items: { type: Type.STRING }
        },
        appointmentIds: {
            type: Type.ARRAY,
            description: "Un array di ID appuntamento che corrispondono alla query di ricerca.",
            items: { type: Type.STRING }
        }
    },
    required: ['customerIds', 'reportIds', 'appointmentIds']
};

export const findDataWithAI = async (
    query: string, 
    contextData: { customers: Customer[], reports: InterventionReport[], appointments: Appointment[] }
): Promise<{ customerIds: string[], reportIds: string[], appointmentIds: string[] }> => {
    
    const customerMap = new Map(contextData.customers.map(c => [c.id, c.name]));
    
    // Riduciamo la quantità di dati inviati per ottimizzare
    const leanContext = {
        customers: contextData.customers.map(c => ({ id: c.id, name: c.name, email: c.email, vatNumber: c.vatNumber })),
        reports: contextData.reports.map(r => ({
            id: r.id,
            customerId: r.customerId,
            interventionType: r.interventionType,
            interventionDate: r.interventionDate,
            notes: r.rawNotes,
            structuredContent: r.structuredReport ? `${r.structuredReport.problemDescription} ${r.structuredReport.actionsTaken} ${r.structuredReport.conclusion}` : ''
        })),
        appointments: contextData.appointments.map(a => ({
            id: a.id,
            title: a.title,
            date: a.date,
            customer: a.customerId ? customerMap.get(a.customerId) : 'Nessuno'
        }))
    };
    
    const prompt = `Sei un assistente di ricerca intelligente per un software di gestione interventi. Analizza la domanda dell'utente e il contesto di dati JSON fornito (che contiene 'customers', 'reports', e 'appointments'). Restituisci un oggetto JSON con tre array, 'customerIds', 'reportIds' e 'appointmentIds', contenenti gli ID degli elementi che corrispondono esattamente alla richiesta dell'utente. Cerca in tutti i campi disponibili.
Domanda utente: "${query}"

Dati di contesto (JSON):
${JSON.stringify(leanContext)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: searchSchema,
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
          throw new Error("La risposta di ricerca dell'API era vuota.");
        }

        const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
        const searchResult: { customerIds: string[], reportIds: string[], appointmentIds: string[] } = JSON.parse(cleanedJsonText);
        return searchResult;

    } catch (error) {
        console.error("Errore durante la ricerca AI con Gemini:", error);
        throw new Error("Impossibile eseguire la ricerca con AI. Riprova più tardi.");
    }
};
