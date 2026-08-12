import { NextResponse } from "next/server";
import { loadSheet } from "@/lib/google";

export async function GET() {
  try {
    const doc = await loadSheet();
    const sheet = doc.sheetsByTitle["Movimenti"];

    if (!sheet) {
      throw new Error('Foglio "Movimenti" non trovato');
    }

    await sheet.loadHeaderRow();

    return NextResponse.json({
      ok: true,
      intestazioni: sheet.headerValues,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        errore: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}