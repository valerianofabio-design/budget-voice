"use client";

import { useState } from "react";

type Movimento = {
  tipo: string;
  data: string;
  categoria: string;
  metodo: string;
  importo: number;
};

export default function Home() {
  const [testo, setTesto] = useState("");
  const [movimento, setMovimento] = useState<Movimento | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [registrazione, setRegistrazione] = useState(false);
  const [messaggio, setMessaggio] = useState("");

  const avviaMicrofono = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Il riconoscimento vocale non è supportato da questo browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "it-IT";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const testoRiconosciuto = event.results[0][0].transcript;
      setTesto(testoRiconosciuto);
    };

    recognition.onerror = () => {
      alert("Non sono riuscito a riconoscere la voce.");
    };

    recognition.start();
  };

  const interpretaComando = async () => {
    if (!testo.trim()) {
      alert("Scrivi o pronuncia un comando.");
      return;
    }

    setCaricamento(true);
    setMovimento(null);
    setMessaggio("");

    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testo: testo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errore || "Errore durante la richiesta");
      }

      const risultato = JSON.parse(data.risultato);

      setMovimento(risultato);
    } catch (error) {
      console.error(error);
      alert("Si è verificato un errore durante l'interpretazione.");
    } finally {
      setCaricamento(false);
    }
  };

  const confermaRegistrazione = async () => {
    if (!movimento) return;

    setRegistrazione(true);
    setMessaggio("");

    try {
      const response = await fetch("/api/movimento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movimento),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errore || "Errore durante la registrazione");
      }

      setMessaggio("✅ Movimento registrato correttamente!");
      setMovimento(null);
      setTesto("");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessaggio(`⚠️ ${error.message}`);
      } else {
        setMessaggio("❌ Errore durante la registrazione.");
      }
    } finally {
      setRegistrazione(false);
    }
  };

  const annulla = () => {
    setMovimento(null);
    setMessaggio("");
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h1 className="text-3xl font-bold text-center text-slate-900">
            Budget Voice
          </h1>

          <p className="text-center text-slate-500 mt-2">
            Registra le tue spese con la voce
          </p>

          <button
            onClick={avviaMicrofono}
            className="mx-auto mt-10 w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-4xl shadow-lg hover:scale-105 transition"
          >
            🎤
          </button>

          <p className="text-center text-sm text-slate-400 mt-4">
            Tocca il microfono e parla
          </p>

          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            placeholder="Oppure scrivi il comando..."
            className="mt-8 w-full h-28 rounded-2xl border border-slate-200 p-4 text-slate-700 outline-none focus:ring-2 focus:ring-slate-400"
          />

          <button
            onClick={interpretaComando}
            disabled={caricamento}
            className="mt-4 w-full rounded-2xl bg-slate-900 text-white py-3 font-semibold disabled:opacity-50"
          >
            {caricamento ? "Sto interpretando..." : "Interpreta comando"}
          </button>

          {messaggio && (
            <div className="mt-4 text-center font-semibold text-slate-700">
              {messaggio}
            </div>
          )}

          {movimento && (
            <div className="mt-6 bg-slate-50 rounded-2xl p-5">

              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Ho capito:
              </h2>

              <div className="space-y-3 text-slate-700">

                <div className="flex justify-between">
                  <span>📅 Data</span>
                  <strong>{movimento.data}</strong>
                </div>

                <div className="flex justify-between">
                  <span>🔴 Tipo</span>
                  <strong>{movimento.tipo}</strong>
                </div>

                <div className="flex justify-between">
                  <span>🏷️ Categoria</span>
                  <strong>{movimento.categoria}</strong>
                </div>

                <div className="flex justify-between">
                  <span>💳 Metodo</span>
                  <strong>
                    {movimento.metodo || "Non specificato"}
                  </strong>
                </div>

                <div className="flex justify-between text-lg">
                  <span>💰 Importo</span>
                  <strong>€ {movimento.importo.toFixed(2)}</strong>
                </div>

              </div>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={annulla}
                  disabled={registrazione}
                  className="flex-1 rounded-2xl border border-slate-300 py-3 font-semibold text-slate-700 disabled:opacity-50"
                >
                  Annulla
                </button>

                <button
                  onClick={confermaRegistrazione}
                  disabled={registrazione}
                  className="flex-1 rounded-2xl bg-slate-900 text-white py-3 font-semibold disabled:opacity-50"
                >
                  {registrazione ? "Registro..." : "Conferma"}
                </button>

              </div>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}