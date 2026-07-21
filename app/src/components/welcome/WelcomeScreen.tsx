import React, { useRef } from 'react';
import { FolderOpen, ShieldCheck } from 'lucide-react';
import type { ViaggioData } from '../../types/viaggio';
import { useViaggioStore } from '../../store/store';

export const WelcomeScreen: React.FC = () => {
  const setViaggioData = useViaggioStore((state) => state.setViaggioData);
  const showToast = useViaggioStore((state) => state.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content) as ViaggioData;

        if (!parsedData.meta || !parsedData.itinerario || !parsedData.trasporti) {
          showToast('Formato JSON non valido ❌');
          return;
        }

        // Enable storage persistence
        if (navigator.storage && navigator.storage.persist) {
          await navigator.storage.persist();
        }

        await setViaggioData(parsedData);
        showToast('Database Viaggio Caricato con Successo! 📂');
      } catch (err) {
        console.error(err);
        showToast('Errore durante la lettura del file JSON ❌');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-center space-y-6">
      {/* Icon & Title */}
      <div className="space-y-3 max-w-sm">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-sky-500 to-amber-500 p-0.5 shadow-2xl flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <span className="text-4xl">✈️</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-100 leading-tight">
          Viaggio Corea & Giappone 2026
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          PWA 100% Offline-First con Architettura di Privacy Zero-Cloud.
        </p>
      </div>

      {/* Zero Cloud Privacy badge */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 max-w-sm w-full space-y-2 text-left shadow-lg">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Memorizzazione Locale Protetta</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          I tuoi dati riservati (PNR, indirizzi hotel, polizze) verranno salvati unicamente nella memoria protetta del tuo dispositivo (IndexedDB). Nessun cloud.
        </p>
      </div>

      {/* Buttons */}
      <div className="space-y-3 max-w-sm w-full">
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-4 px-6 rounded-2xl shadow-xl transition-all active:scale-95 text-sm flex items-center justify-center space-x-2"
        >
          <FolderOpen className="w-5 h-5" />
          <span>📂 Carica Database Viaggio (.json)</span>
        </button>
      </div>
    </div>
  );
};
