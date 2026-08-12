import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import fs from "fs";
import path from "path";

let clientEmail: string;
let privateKey: string;

// Se sono presenti le variabili d'ambiente,
// usiamo quelle (Vercel).
if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
  clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
} else {
  // In locale continuiamo a usare il file JSON.
  const credentialsPath = path.join(
    process.cwd(),
    "lezioni-allievi-4b056182017b.json"
  );

  const credentials = JSON.parse(
    fs.readFileSync(credentialsPath, "utf8")
  );

  clientEmail = credentials.client_email;
  privateKey = credentials.private_key;
}

const auth = new JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(
  "1jK8EADwiEC2jLiPwrFdmCNtk6KY9P1WbJOPPo1jYRfE",
  auth
);

export async function loadSheet() {
  await doc.loadInfo();
  return doc;
}