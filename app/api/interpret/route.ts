import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { testo } = await request.json();

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: `
Interpreta questo comando relativo alla gestione delle spese personali:

"${testo}"

Restituisci esclusivamente un JSON con questa struttura:

{
  "tipo": "Uscita",
  "data": "YYYY-MM-DD",
  "categoria": "",
  "metodo": "",
  "importo": 0
}

Regole:
- Se non viene indicata una data, usa oggi.
- "oggi" significa la data odierna.
- "ieri" significa il giorno precedente.
- Se viene indicato giorno e mese senza anno, usa l'anno corrente.
- Per ora considera esclusivamente le uscite.
- L'importo deve essere un numero positivo.
- Non aggiungere spiegazioni fuori dal JSON.
      `,
    });

    return NextResponse.json({
      risultato: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { errore: "Errore durante l'interpretazione del comando" },
      { status: 500 }
    );
  }
}