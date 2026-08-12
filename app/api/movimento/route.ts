import { NextResponse } from "next/server";
import { loadSheet } from "@/lib/google";

export async function POST(request: Request) {
  try {
    const movimento = await request.json();

    const doc = await loadSheet();

    // Foglio Movimenti
    const sheet = doc.sheetsByTitle["Movimenti"];

    if (!sheet) {
      throw new Error('Foglio "Movimenti" non trovato');
    }

    // Foglio Categorie
    const categorieSheet = doc.sheetsByTitle["CATEGORIE"];

    if (!categorieSheet) {
      throw new Error('Foglio "CATEGORIE" non trovato');
    }

    // Leggiamo le categorie dalla colonna A
    const righeCategorie = await categorieSheet.getRows();

    const categorie = righeCategorie
      .map((row) => String(row.get("CATEGORIA") || "").trim())
      .filter((categoria) => categoria !== "");

    // Controllo categoria
    const categoriaInserita = String(movimento.categoria || "").trim();

    const categoriaValida = categorie.some(
      (categoria) =>
        categoria.toLowerCase() === categoriaInserita.toLowerCase()
    );

    if (!categoriaValida) {
      return NextResponse.json(
        {
          ok: false,
          errore: `La categoria "${categoriaInserita}" non è presente nel foglio CATEGORIE.`,
        },
        { status: 400 }
      );
    }

    // Normalizziamo l'importo.
    // Uscita = negativa
    // Entrata = positiva
    const importo = Math.abs(Number(movimento.importo));

    if (!Number.isFinite(importo)) {
      throw new Error("Importo non valido");
    }

    const tipo = String(movimento.tipo || "").trim();

    const importoFinale =
      tipo.toLowerCase() === "uscita"
        ? -importo
        : importo;

    // Scrittura nel foglio Movimenti
    await sheet.addRow({
      Data: movimento.data,
      TIPO: tipo,
      CATEGORIA: movimento.categoria,
      METODO: movimento.metodo,
      IMPORTO: importoFinale,
    });

    return NextResponse.json({
      ok: true,
      messaggio: "Movimento registrato correttamente",
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