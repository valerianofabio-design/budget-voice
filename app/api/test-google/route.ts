import { NextResponse } from "next/server";

export async function GET() {
  try {
    const email = process.env.GOOGLE_CLIENT_EMAIL || "";

    const b64 = process.env.GOOGLE_PRIVATE_KEY_B64 || "";
    const pem = process.env.GOOGLE_PRIVATE_KEY || "";

    let b64Info = null;

    if (b64) {
      try {
        const decoded = Buffer.from(b64, "base64").toString("utf8");

        b64Info = {
          presente: true,
          lunghezzaBase64: b64.length,
          lunghezzaDecodificata: decoded.length,
          inizioCorretto: decoded.startsWith("-----BEGIN PRIVATE KEY-----"),
          fineCorretto: decoded.trim().endsWith("-----END PRIVATE KEY-----"),
          contieneNewline: decoded.includes("\n"),
        };
      } catch {
        b64Info = {
          presente: true,
          erroreDecodifica: true,
        };
      }
    }

    return NextResponse.json({
      ok: true,

      account: email,

      privateKeyBase64: b64Info,

      privateKeyNormale: {
        presente: !!pem,
        lunghezza: pem.length,
        inizioCorretto: pem
          .trim()
          .replace(/^["']|["']$/g, "")
          .startsWith("-----BEGIN PRIVATE KEY-----"),
        fineCorretta: pem
          .trim()
          .replace(/^["']|["']$/g, "")
          .endsWith("-----END PRIVATE KEY-----"),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errore: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}