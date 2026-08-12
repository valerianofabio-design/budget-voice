import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import fs from "fs";
import path from "path";

const credentialsPath = path.join(
  process.cwd(),
  "lezioni-allievi-4b056182017b.json"
);

const credentials = JSON.parse(
  fs.readFileSync(credentialsPath, "utf8")
);

const auth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
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