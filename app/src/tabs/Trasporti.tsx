import React, { useState } from 'react';
import { Plane, Train, Hotel, Package, AlertCircle, Ticket, Globe, ExternalLink, MapPin } from 'lucide-react';
import { useViaggioStore } from '../store/store';
import { CopyableText } from '../components/ui/CopyableText';
import { TransitCard3Col } from '../components/ui/TransitCard3Col';
import { getMapDeepLink } from '../utils/linkUtils';

export const TrasportiTab: React.FC = () => {
  const data = useViaggioStore((state) => state.data);
  const openTaxiCard = useViaggioStore((state) => state.openTaxiCard);

  const [activeFilter, setActiveFilter] = useState<'Tutti' | 'Voli' | 'Treni' | 'Alloggi' | 'Biglietti'>('Tutti');
  const [hidePast, setHidePast] = useState<boolean>(false);

  if (!data) return null;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const yamatoHotel = data.alloggi.find((h) => h.id === 'H6') || data.alloggi[0];

  const filteredVoli = data.trasporti.voli.filter((volo) => !hidePast || volo.data >= todayStr);
  const filteredTreni = [
    ...(data.trasporti.treni || []),
    ...(data.trasporti.bus || [])
  ].filter((item) => !hidePast || item.data >= todayStr);

  // Extract tickets & vouchers from schedule details
  const extractedTickets: { title: string; date: string; details: string; code?: string }[] = [];
  data.itinerario.forEach((g) => {
    g.tabella_oraria.forEach((item) => {
      if (
        item.dettagli &&
        (item.dettagli.toLowerCase().includes('ticket') ||
         item.dettagli.toLowerCase().includes('prenotato') ||
         item.dettagli.toLowerCase().includes('codice'))
      ) {
        const match = item.dettagli.match(/(Codice:\s*[\w-]+|Ticket ID:\s*[\w-]+|PNR:\s*[\w-]+)/i);
        extractedTickets.push({
          title: item.attivita,
          date: `${g.data} (Giorno ${g.giorno})`,
          details: item.dettagli,
          code: match ? match[0] : undefined,
        });
      }
    });
  });

  return (
    <div className="space-y-6 pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Header & Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Viaggi, Alloggi & Biglietti</h2>

          {/* Toggle Passati Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setHidePast(false)}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                !hidePast
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mostra passati
            </button>
            <button
              type="button"
              onClick={() => setHidePast(true)}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                hidePast
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nascondi passati
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {(['Tutti', 'Voli', 'Treni', 'Alloggi', 'Biglietti'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                activeFilter === filter
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {filter === 'Tutti'
                ? 'Tutti'
                : filter === 'Voli'
                ? '✈️ Voli'
                : filter === 'Treni'
                ? '🚄 Treni & Bus'
                : filter === 'Alloggi'
                ? '🏨 Alloggi'
                : '🎟️ Biglietti'}
            </button>
          ))}
        </div>
      </div>

      {/* Voli Section */}
      {(activeFilter === 'Tutti' || activeFilter === 'Voli') && (
        <div className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-sky-400 flex items-center space-x-2">
            <Plane className="w-4 h-4" />
            <span>Voli ({filteredVoli.length})</span>
          </h2>

          <div className="space-y-2.5">
            {filteredVoli.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400">
                Nessun volo passato o futuro trovato.
              </div>
            ) : (
              filteredVoli.map((volo) => (
                <div
                  key={volo.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sky-400">{volo.id} • {volo.data}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {volo.stato}
                    </span>
                  </div>

                  <TransitCard3Col
                    tratta={`${volo.citta_partenza} (${volo.aeroporto_partenza}) -> ${volo.citta_arrivo} (${volo.aeroporto_arrivo})`}
                    orario={`${volo.ora_partenza} -> ${volo.ora_arrivo}`}
                    durata={volo.durata}
                    isVolo={true}
                  />

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">{volo.compagnia}</span>
                    <div className="flex items-center space-x-1 font-mono">
                      <span className="text-slate-400">PNR:</span>
                      <CopyableText text={volo.pnr} className="font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30" />
                    </div>
                  </div>

                  {volo.note && (
                    <div className="text-xs bg-rose-950/40 border border-rose-800/60 text-rose-300 p-2.5 rounded-xl flex items-center space-x-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{volo.note}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Treni & Bus Section */}
      {(activeFilter === 'Tutti' || activeFilter === 'Treni') && (
        <div className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-amber-400 flex items-center space-x-2">
            <Train className="w-4 h-4" />
            <span>Treni & Bus ({filteredTreni.length})</span>
          </h2>

          <div className="space-y-2.5">
            {filteredTreni.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400">
                Nessun treno passato o futuro trovato.
              </div>
            ) : (
              filteredTreni.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">{item.id} • {item.data}</span>
                    <span className="text-xs font-semibold text-slate-300">{'mezzo' in item ? item.mezzo : item.vettore}</span>
                  </div>

                  <TransitCard3Col
                    tratta={`${item.stazione_partenza} -> ${item.stazione_arrivo}`}
                    orario={`${item.ora_partenza} -> ${item.ora_arrivo}`}
                    durata={'durata' in item ? item.durata : undefined}
                    isVolo={false}
                  />

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400">Posti:</span> <span className="font-semibold text-slate-200">{Array.isArray(item.posti) ? item.posti.join(', ') : item.posti || 'N/A'}</span>
                    </div>
                    {'pnr' in item && item.pnr && (
                      <div className="flex items-center space-x-1 font-mono">
                        <span className="text-slate-400">PNR:</span>
                        <CopyableText text={item.pnr} className="font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30" />
                      </div>
                    )}
                  </div>

                  {'codice_ritiro' in item && item.codice_ritiro && (
                    <div className="text-xs font-mono text-slate-300">
                      <span className="text-slate-400">Codice Ritiro:</span>{' '}
                      <CopyableText text={item.codice_ritiro} className="font-bold text-emerald-300" />
                    </div>
                  )}

                  {item.note && <div className="text-xs text-amber-300/90 italic">Note: {item.note}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Yamato Takkyubin luggage Card */}
      {(activeFilter === 'Tutti' || activeFilter === 'Alloggi') && (
        <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-amber-300">Yamato Transport (Takkyubin)</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Spedizione valigie grande Shinjuku ➔ Osaka (Hotel S-Presso West). Mostra questo indirizzo al punto Yamato.
          </p>

          <button
            type="button"
            onClick={() =>
              openTaxiCard({
                name: yamatoHotel.nome,
                nameLocale: yamatoHotel.nome_locale,
                addressLocale: yamatoHotel.indirizzo_locale,
                addressEn: yamatoHotel.indirizzo_en,
              })
            }
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>🚗 Mostra Indirizzo Osaka a Schermo Intero</span>
          </button>
        </div>
      )}

      {/* Biglietti Section */}
      {(activeFilter === 'Tutti' || activeFilter === 'Biglietti') && (
        <div className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-purple-400 flex items-center space-x-2">
            <Ticket className="w-4 h-4" />
            <span>Biglietti Musei & Eventi ({extractedTickets.length})</span>
          </h2>

          {/* Cloud Documents / Google Drive Voucher Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Documenti & Voucher Cloud</span>
            </h3>

            <p className="text-xs text-slate-400">
              Link diretto alla cartella Google Drive di backup per recuperare le prenotazioni originali.
            </p>

            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold py-2.5 px-4 rounded-xl text-xs shadow transition-all active:scale-95 flex items-center justify-center space-x-2 border border-slate-700"
            >
              <span>Apri Google Drive Voucher</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-2.5">
            {extractedTickets.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.title}</span>
                  <span className="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded font-mono font-semibold">
                    {t.date}
                  </span>
                </div>

                <div className="text-xs text-slate-400">{t.details}</div>

                {t.code && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400 font-semibold">Codice di Accesso:</span>
                    <CopyableText
                      text={t.code}
                      className="font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alloggi Section */}
      {(activeFilter === 'Tutti' || activeFilter === 'Alloggi') && (
        <div className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider font-bold text-purple-400 flex items-center space-x-2">
            <Hotel className="w-4 h-4" />
            <span>Registro Alloggi (H1 - H6)</span>
          </h2>

          <div className="space-y-3">
            {data.alloggi.map((h) => (
              <div
                key={h.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400">{h.id} • {h.citta}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {h.stato_pagamento}
                  </span>
                </div>

                <div className="text-sm font-bold text-white">{h.nome}</div>

                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-slate-400">EN:</span>{' '}
                    <CopyableText text={h.indirizzo_en} className="text-slate-200" />
                  </div>
                  <div>
                    <span className="text-slate-400">Locale:</span>{' '}
                    <CopyableText text={h.indirizzo_locale} className="font-bold text-amber-300" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400">Check-in:</span> {h.check_in}
                  </div>
                  <div>
                    <span className="text-slate-400">Notti:</span> {h.notti}
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="text-slate-400 font-semibold">Stazione:</span> {h.stazione}
                </div>

                {h.note && (
                  <div className="text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                    {h.note}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openTaxiCard({
                        name: h.nome,
                        nameLocale: h.nome_locale,
                        addressLocale: h.indirizzo_locale,
                        addressEn: h.indirizzo_en,
                      })
                    }
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/30 shadow transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <span>🚗 Taxi Card</span>
                  </button>
                  <a
                    href={getMapDeepLink(h.nome, h.citta)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold rounded-xl text-xs border border-sky-500/30 shadow transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrasportiTab;
