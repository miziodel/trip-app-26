import fs from 'fs';
import path from 'path';

const v3Path = path.resolve(process.cwd(), 'viaggio-2026-v3.json');
const targetPath = path.resolve(process.cwd(), 'viaggio-2026-v5.json');

const raw = fs.readFileSync(v3Path, 'utf8');
const data = JSON.parse(raw);

// 1. Update Meta Version & Passengers e-tickets
data.meta.versione = "5.0-v5";
data.meta.passeggeri = [
  {
    nome: "Maurizio Delmonte",
    documento: "PASSPORT_MAURIZIO",
    eticket_air_china: "9992985792237-238",
    eticket_ana: "2052985792255"
  },
  {
    nome: "Paola Cennerelli",
    documento: "PASSPORT_PAOLA",
    eticket_air_china: "9992985792239-240",
    eticket_ana: "2052985792254"
  }
];

// 2. Update Alloggi - H1 Insadong, H2 Tokyo, H3 Kanazawa, H5 Gujo details
data.alloggi = data.alloggi.map(h => {
  if (h.id === 'H1') {
    return {
      ...h,
      telefono_host: "+82 70 4154 4863"
    };
  }
  if (h.id === 'H2') {
    return {
      ...h,
      nome: "Maison Jeunesse Camera 101",
      nome_locale: "メゾン・ジュネス 101室",
      link_prenotazione: "https://www.airbnb.it/rooms/948873888166246209",
      telefono_host: "+81 90 6420 1210"
    };
  }
  if (h.id === 'H3') {
    return {
      ...h,
      note: "Onsen pubblico (⚠️ Divieto assoluto tatuaggi - No cerotti), Colazione Inclusa",
      features: [
        "Onsen pubblico (⚠️ Divieto assoluto tatuaggi - No cerotti)",
        "Colazione Inclusa"
      ]
    };
  }
  if (h.id === 'H5') {
    return {
      ...h,
      indirizzo_en: "382 Minamichō Mito, Gujo, Gifu 501-4105, Giappone",
      indirizzo_locale: "〒501-4105 岐阜県郡上市美波町水戸382",
      telefono_host: "+81 90-1696-2083",
      note: "Jeenie (host) - +81 90-1696-2083. Lavatrice/Asciugatrice, Bagno condiviso, No colazione",
      features: [
        "Jeenie (host) - +81 90-1696-2083",
        "Lavatrice/Asciugatrice",
        "Bagno condiviso",
        "No colazione"
      ]
    };
  }
  return h;
});

// 3. Update Voli - Mappatura esatta V1-V5 da v9.md + specifiche bagagli 2026
data.trasporti.voli = [
  {
    id: "V1",
    data: "2026-07-27",
    aeroporto_partenza: "FCO",
    aeroporto_arrivo: "PEK",
    citta_partenza: "Roma",
    citta_arrivo: "Pechino",
    ora_partenza: "20:30",
    ora_arrivo: "12:45",
    giorno_arrivo_offset: 1,
    durata: "10h 15m",
    compagnia: "Air China CA 940",
    numero_volo: "CA 940",
    pnr: "FJMTYD",
    stato: "Confermato",
    note: "Boeing 777-300. Franchigia: Mano 1x 5kg (55x40x20cm), Stiva 2x 23kg a testa (max 158cm)."
  },
  {
    id: "V2",
    data: "2026-07-28",
    aeroporto_partenza: "PEK",
    aeroporto_arrivo: "ICN",
    citta_partenza: "Pechino",
    citta_arrivo: "Seoul",
    ora_partenza: "18:50",
    ora_arrivo: "21:45",
    giorno_arrivo_offset: 0,
    durata: "1h 55m",
    compagnia: "Air China CA 709",
    numero_volo: "CA 709",
    pnr: "FJMTYD",
    stato: "Confermato",
    note: "Airbus A321. Transito PEK: 6h 05m."
  },
  {
    id: "V3",
    data: "2026-08-01",
    aeroporto_partenza: "GMP",
    aeroporto_arrivo: "HND",
    citta_partenza: "Seoul",
    citta_arrivo: "Tokyo",
    ora_partenza: "12:40",
    ora_arrivo: "14:55",
    giorno_arrivo_offset: 0,
    durata: "2h 15m",
    compagnia: "All Nippon Airways NH 864",
    numero_volo: "NH 864",
    pnr: "FJVGH3",
    stato: "Confermato",
    note: "Boeing 767. Pasto caldo incluso. ⚠️ REGOLE BAGAGLI ANA 2026: Peso totale cabina max 10kg. Borsa personale sotto il sedile MAX 40x30x20 cm."
  },
  {
    id: "V4",
    data: "2026-08-20",
    aeroporto_partenza: "KIX",
    aeroporto_arrivo: "PEK",
    citta_partenza: "Osaka",
    citta_arrivo: "Pechino",
    ora_partenza: "09:05",
    ora_arrivo: "11:25",
    giorno_arrivo_offset: 0,
    durata: "3h 20m",
    compagnia: "Air China CA 162",
    numero_volo: "CA 162",
    pnr: "FJMTYD",
    stato: "Confermato",
    note: "Airbus A321. Sveglia ore 04:30. Treno Airport Express alle 05:15."
  },
  {
    id: "V5",
    data: "2026-08-20",
    aeroporto_partenza: "PEK",
    aeroporto_arrivo: "FCO",
    citta_partenza: "Pechino",
    citta_arrivo: "Roma",
    ora_partenza: "13:20",
    ora_arrivo: "18:30",
    giorno_arrivo_offset: 0,
    durata: "11h 10m",
    compagnia: "Air China CA 939",
    numero_volo: "CA 939",
    pnr: "FJMTYD",
    stato: "Confermato",
    note: "Boeing 777-300. Transito PEK: 1h 55m (Connessione Stretta) - Zero Power Bank nei bagagli."
  }
];

// 4. Update Bus tratte
data.trasporti.bus = data.trasporti.bus.map(b => {
  if (b.id === 'B1') {
    return { ...b, durata: "2h 15m", codice_prenotazione: "07122010861" };
  }
  if (b.id === 'B2') {
    return { ...b, durata: "1h 21m", codice_prenotazione: "116572765" };
  }
  if (b.id === 'B3') {
    return { ...b, durata: "4h 31m", codice_prenotazione: "07162002992" };
  }
  return b;
});

// 5. Update Protocolli (Inclusi tutti i precedenti + nuovi bagagli 2026)
data.protocolli = {
  onsen: {
    titolo: "🛀 Onsen Etiquette & Policy Tatuaggi",
    regole: [
      "Spogliarsi totalmente nello spogliatoio (costume vietato). Portare solo il piccolo asciugamano tenugui.",
      "Lavarsi e sciacquarsi accuratamente seduti sugli sgabelli di plastica prima di entrare in acqua.",
      "Entrare lentamente in vasca senza mai immergere l'asciugamano nell'acqua termale.",
      "Hotel Vista Kanazawa: DIVIETO ASSOLUTO TATUAGGI nella vasca comune. I cerotti coprenti (cover stickers) NON sono consentiti.",
      "Takayama Ouan: 3 vasche private esterne (kashikiri) prenotabili gratis alla reception per chi ha tatuaggi (accesso garantito senza coperture)."
    ]
  },
  pechino_transito: {
    titolo: "✈️ Protocollo Definitivo Transito Pechino PEK (1h 55m)",
    istruzioni: [
      "Al check-in di Osaka KIX richiedere Thru-check dei bagagli fino a Roma FCO e adesivo Priority Connection.",
      "All'atterraggio al Terminal 3-E seguire esclusivamente i cartelli blu International Transfer / 24-Hour Transit (國際轉機).",
      "STRATEGIA ZERO-RISK POWER BANK: Non portare alcun Power Bank nei bagagli a mano o stivati per azzerare qualsiasi ritardo o ispezione ai controlli di sicurezza cinesi.",
      "Presentare passaporto e seconda carta d'imbarco al varco transiti per il timbro rapido."
    ]
  },
  nagaragawa_railway: {
    titolo: "🚃 Regole Nagaragawa Railway & Spese a Gujo",
    istruzioni: [
      "La ferrovia locale Nagaragawa Railway NON accetta carte contactless Suica/Pasmo o carte di credito.",
      "Il pagamento del biglietto o della corsa avviene esclusivamente in CONTANTI e MONETE.",
      "Fotografare subito in stazione l'orario dei treni notturni straordinari per il rientro dal Gujo Odori.",
      "Le bancarelle yatai del festival e i negozietti tradizionali di Gujo accettano solo contante."
    ]
  },
  contanti_seoul: {
    titolo: "💳 Contanti & Prelievi a Seoul",
    istruzioni: [
      "Scegli solo ATM Global o Foreign Card (presenti in aeroporto, stazioni e banche Shinhan, Hana, KB) per evitare che la carta venga rifiutata.",
      "Tassa fissa locali ATM: quasi tutti gli ATM addebitano ~3.000–4.800 KRW (2–3,50 €). Evita tanti piccoli prelievi.",
      "Scegli sempre l'addebito in KRW (no conversione dinamica) per evitare tassi svantaggiosi.",
      "Converti gli Euro in Won in-app (es. Revolut) da lunedì a venerdì per evitare le maggiorazioni del weekend.",
      "Limitare il contante al minimo: pagamenti digitali ovunque, contanti usati per ricaricare T-Money e nei mercati tradizionali."
    ]
  },
  bus_6002_icn: {
    titolo: "🚌 Airport Bus 6002 Incheon (ICN) -> Jongno 3-ga / Insadong",
    istruzioni: [
      "Tratta e durata: Da ICN Terminal 1 o 2 fino a Jongno 3-ga / Insadong (durata 80–90 minuti).",
      "Prezzi: Adulti 17.000 KRW (~11,50 €), Bambini 6–12 anni 12.000 KRW (~8,00 €).",
      "Pagamenti accettati: Carte di credito/debito internazionali (Revolut) ai desk o al lettore contactless sul bus; T-Money / WOWPASS al lettore; contanti alle biglietterie aeroporto.",
      "Fermate in aeroporto: Terminal 1 Banchina 5B-4 (Piano 1F Arrivi); Terminal 2 Banchina 30 (Piano B1 Centro Trasporti)."
    ]
  },
  t_money_rimborso: {
    titolo: "💳 Gestione & Rimborso Saldo Residuo T-Money",
    istruzioni: [
      "Rimborso in contanti: Chiedi il rimborso nei convenience store (CU, GS25, 7-Eleven), stazioni metro o aeroporto. Restituzione in KRW contanti con commissione fissa di 500 KRW (per saldi fino a 20.000–30.000 KRW).",
      "Azzera il saldo con acquisti: Usala come carta di debito nei convenience store, Olive Young o distributori automatici. Il resto mancante si può saldare in contanti o Revolut.",
      "Nessuna scadenza: La tessera e il credito non scadono mai. Puoi regalarla o prestarla ad amici.",
      "Nota: Il costo di acquisto della tessera di plastica (3.000–5.000 KRW) non è mai rimborsabile."
    ]
  },
  bagagli_ana_2026: {
    titolo: "🎒 Nuova Normativa Bagaglio a Mano ANA 2026 (Seoul ➔ Tokyo)",
    istruzioni: [
      "Attenzione al volo ANA NH 864 (01 Agosto): in vigore dal 1° Luglio 2026 nuove regole tassative per la cabina.",
      "Oggetto personale sotto il sedile: dimensioni massime 40 cm x 30 cm x 20 cm.",
      "Peso combinato cabina: Il peso totale di bagaglio a mano (55x40x25cm) + borsa personale non deve superare i 10 kg totali.",
      "Controlli al gate: Le borse fuori misura verranno imbarcate in stiva a pagamento."
    ]
  },
  bagagli_liquidi: {
    titolo: "🧪 Regolamento Liquidi in Cabina (LAG)",
    istruzioni: [
      "Contenitori da max 100 ml (o 100 g) ciascuno.",
      "Tutti i flaconi inseriti in un unico sacchetto di plastica trasparente richiudibile da max 1 Litro (20 cm x 20 cm).",
      "Consentito un solo sacchetto a passeggero, da estrarre ai controlli di sicurezza."
    ]
  }
};

// 6. Update Itinerario & Checklist To-Dos
data.itinerario = data.itinerario.map(g => {
  let dayTodos = [];

  if (Array.isArray(g.todo_list)) {
    dayTodos = g.todo_list.map(t => ({ ...t, fatto: false }));
  }

  // Giorno Volo Partenza (27/28 Luglio)
  if (g.giorno === 0 || g.data === "2026-07-27" || g.data === "2026-07-28") {
    dayTodos = [
      { testo: "Convertire EUR in KRW e JPY in-app (es. su Revolut) prima di partire per avere saldo pronto in valuta locale", fatto: false },
      { testo: "Attivare la eSIM Saily per la Corea del Sud all'arrivo all'aeroporto di Incheon (ICN)", fatto: false },
      { testo: "Acquistare un Power Bank a Pechino (PEK) se necessario durante il layover/transito", fatto: false },
      { testo: "Acquistare biglietto Bus Limousine 6002 alle macchinette automatiche (1F) prima dell'imbarco", fatto: false },
      { testo: "Per eventuale taxi dall'aeroporto ICN o a Seoul, utilizzare l'app K.Ride", fatto: false },
      { testo: "Richiedere il biglietto da visita dell'hotel (Wecostay Insadong) alla reception/ingresso con l'indirizzo scritto in coreano per i taxi", fatto: false }
    ];
  }

  // Giorno 1 (29 Luglio)
  if (g.giorno === 1) {
    dayTodos = [
      { testo: "Comprare e caricare le tessere T-Money fisiche al convenience store (ricarica ₩15.000/pp)", fatto: false },
      { testo: "Utilizzare Naver Map per l'itinerario a piedi da Amorepacific a Yongmun Market", fatto: false }
    ];
  }

  // Giorno 2 (30 Luglio)
  if (g.giorno === 2) {
    dayTodos = [
      { testo: "Mettiti in coda su CatchTable per Sancheong Sutbul Garden prima di arrivare a Euljiro", fatto: false }
    ];
  }

  // Giorno 3 (31 Luglio)
  if (g.giorno === 3) {
    const newItems = [];
    g.tabella_oraria.forEach(item => {
      newItems.push(item);
      if (item.ora === "10:00") {
        newItems.push({
          ora: "12:00",
          ora_fine: "13:00",
          tipo: "attivita",
          attivita: "Hyundai Card Music Library & Vinyl & Plastic",
          dettagli: "Gemma Nascosta (Music & Design): ascolto vinili e architettura d'interni ad Hannam-dong",
          maps_provider: "naver",
          maps_query: "Hyundai Card Music Library"
        });
      }
    });
    newItems.forEach(item => {
      if (item.attivita.includes("Parc")) {
        item.ora = "13:00";
        item.ora_fine = "14:15";
      }
      if (item.attivita.includes("HIKR")) {
        item.ora = "14:45";
        item.ora_fine = "16:30";
      }
    });

    dayTodos = [
      { testo: "Controllare la prenotazione del Leeum Museum (M1 ore 10:00)", fatto: false },
      { testo: "Preparare gli zaini e verificare che la borsa borsa personale per il volo ANA rispetti i 40x30x20 cm (max 10kg totali cabina)", fatto: false }
    ];

    return {
      ...g,
      titolo: "Arte Contemporanea, K-Pop, Vinili & Indie Culture",
      focus: "Leeum Museum of Art, Hyundai Card Music Library (Hannam-dong) e Hongdae (Sera)",
      vibe: "Musei d'autore, cultura dei vinili, architettura d'interni, università e busking",
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  // Giorno 4 (1 Agosto - Tokyo & Incontro Miki)
  if (g.giorno === 4) {
    const newItems = g.tabella_oraria.map(item => {
      if (item.attivita.includes("Nakameguro Awa Odori")) {
        return {
          ...item,
          dettagli: "Sfilata di danze tradizionali lungo il fiume. ⭐⭐ INCONTRO CON MIKI (Amica di Tom - contatto WhatsApp)! Passare la serata insieme al festival."
        };
      }
      return item;
    });

    dayTodos = [
      { testo: "Attivare la eSIM Ubigi per il Giappone all'arrivo all'aeroporto di Haneda (HND)", fatto: false },
      { testo: "Stampare o salvare i QR code di Visit Japan Web per velocizzare l'ingresso ad Haneda", fatto: false },
      { testo: "Acquistare la tessera Suica fisica alle emettitrici JR di Shin-Okubo (Maurizio)", fatto: false },
      { testo: "Richiedere il biglietto da visita / memorizzare l'indirizzo in giapponese della Maison Jeunesse (Kitashinjuku 1-6-6) per i taxi", fatto: false },
      { testo: "Ricordarsi di usare l'app NAVITIME (migliore di Google Maps) per la navigazione sui trasporti pubblici di Tokyo e del Giappone!", fatto: false },
      { testo: "Contattare Miki su WhatsApp per decidere a che ora e dove vederci ad Awa Odori / Nakameguro!", fatto: false },
      { testo: "Acquistare occhiali da sole da JINS Shinjuku!", fatto: false }
    ];

    return {
      ...g,
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  // Giorno 5 (2 Agosto)
  if (g.giorno === 5) {
    dayTodos = [
      { testo: "Ritirare i biglietti cartacei Shinkansen per il 10 agosto allo sportello JR East Travel Service Center a Shinjuku esibendo passaporti e QR Code", fatto: false }
    ];
  }

  // Giorno 6 (3 Agosto)
  if (g.giorno === 6) {
    const newItems = [];
    g.tabella_oraria.forEach(item => {
      if (item.attivita.includes("Shiro-Hige")) {
        newItems.push(item);
        newItems.push({
          ora: "16:30",
          ora_fine: "17:30",
          tipo: "attivita",
          attivita: "Reload Shimokitazawa",
          dettagli: "Gemma Integrata (Architettura & Relax): struttura sui binari interrati con librerie, caffè e AC",
          maps_provider: "google",
          maps_query: "Reload Shimokitazawa"
        });
      } else if (item.attivita.includes("negozi di dischi")) {
        newItems.push({
          ...item,
          ora: "17:30",
          ora_fine: "18:45"
        });
      } else if (item.attivita.includes("Rientro in treno")) {
        newItems.push({
          ...item,
          ora: "18:45",
          ora_fine: "20:00"
        });
      } else {
        newItems.push(item);
      }
    });

    return {
      ...g,
      titolo: "Shimokitazawa Slow Day Indie & Reload",
      focus: "Intera giornata a Shimokitazawa con la nuova area binari",
      vibe: "Lento, negozi di vinili, abbigliamento vintage, nuove strutture minimali e caffè",
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  // Giorno 7 (4 Agosto)
  if (g.giorno === 7) {
    const newItems = g.tabella_oraria
      .filter(item => !item.attivita.includes("Kichijoji"))
      .map(item => {
        if (item.attivita.includes("Pranzo")) {
          return {
            ...item,
            attivita: "Pranzo Musashi-Koganei",
            dettagli: "Pranzo rilassato a Musashi-Koganei o caffetteria parco Edo-Tokyo per evitare affollamento"
          };
        }
        if (item.attivita.includes("Nishi-Ogi")) {
          return {
            ...item,
            ora: "15:15",
            ora_fine: "17:00",
            dettagli: "Nishi-Ogi Antique Street: antiquariato Showa, giocattoli e oggettistica nostalgica (Kichijoji rimossa per evitare stanchezza)"
          };
        }
        return item;
      });

    return {
      ...g,
      titolo: "Musei all'Aperto, Antiquariato Showa & Izakaya Sotto i Binari",
      focus: "Edo-Tokyo Open Air Museum (Koganei), Nishi-Ogikubo e Koenji (Ottimizzato: No Kichijoji)",
      intensita: "media-alta",
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  // Giorno 8 (5 Agosto)
  if (g.giorno === 8) {
    dayTodos = [
      { testo: "Presentarsi all'ingresso di teamLab Borderless con il codice prenotazione entro le 09:00", fatto: false },
      { testo: "Mostrare i codici e-ticket per la mostra di Ron Mueck alle 16:00 al Mori Tower", fatto: false }
    ];
  }

  // Giorno 10 (7 Agosto)
  if (g.giorno === 10) {
    const newItems = g.tabella_oraria.map(item => {
      if (item.attivita.includes("Prelievo Contante") || item.attivita.includes("Shopping")) {
        return {
          ...item,
          dettagli: "⚠️ PRELIEVO CONTANTI (CRITICO): ¥70.000–80.000 a persona presso ATM 7-Bank. Indispensabile per Nagaragawa Railway e Gujo Hachiman (accettano esclusivamente contante in monete/banconote). Selezionare addebito in JPY."
        };
      }
      return item;
    });

    dayTodos = [
      { testo: "Effettuare il prelievo obbligatorio di ¥70.000–80.000 a persona presso ATM 7-Bank prima delle Alpi (Nagaragawa Railway & Gujo accettano solo contante)", fatto: false }
    ];

    return {
      ...g,
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  // Giorno 11 (8 Agosto)
  if (g.giorno === 11) {
    const newItems = g.tabella_oraria.map(item => {
      if (item.attivita.includes("Asagaya Tanabata Matsuri")) {
        return {
          ...item,
          ora: "19:00",
          ora_fine: "21:30",
          attivita: "Asagaya Tanabata Matsuri",
          dettagli: "Sfilata sotto l'immensa galleria commerciale coperta Pearl Center, decorata con centinaia di enormi personaggi di cartapesta fatti a mano dai negozianti. Cena street food alle bancarelle."
        };
      }
      return item;
    });

    dayTodos = [
      { testo: "Portare un paio di calzini puliti nello zaino per eventuale visita all'Asakura Museum of Sculpture", fatto: false }
    ];

    return {
      ...g,
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  // Giorno 12 (9 Agosto)
  if (g.giorno === 12) {
    dayTodos = [
      { testo: "Spedire le valigie grandi da Yamato Hyakunincho a Osaka Hotel S-Presso West (impostare consegna 16 agosto)", fatto: false },
      { testo: "Inviare mail/messaggio all'Hotel S-Presso West di Osaka per autorizzare la ricezione dei bagagli prima del check-in", fatto: false },
      { testo: "Conservare la ricevuta cartacea Yamato nello zaino per il tracciamento", fatto: false }
    ];
  }

  // Giorno 13 (10 Agosto - Kanazawa)
  if (g.giorno === 13) {
    dayTodos = [
      { testo: "Richiedere il biglietto da visita dell'Hotel Vista Kanazawa alla reception con l'indirizzo scritto in giapponese per i taxi", fatto: false },
      { testo: "Accettare il divieto di accesso all'onsen pubblico dell'Hotel Vista Kanazawa se si hanno tatuaggi (no cerotti coprenti)", fatto: false }
    ];
  }

  // Giorno 14 (11 Agosto)
  if (g.giorno === 14) {
    const newItems = [];
    g.tabella_oraria.forEach(item => {
      if (item.attivita.includes("Kanazawa Castle")) {
        newItems.push({
          ora: "08:30",
          ora_fine: "09:45",
          tipo: "attivita",
          attivita: "Kanazawa Castle & Gyokusen-inmaru Garden",
          dettagli: "Gemma Integrata (Contemplazione): Giardino Gyokusen-inmaru adiacente al castello. Atmosfera meditativa con sala da tè affacciata su pareti rocciose d'acqua",
          maps_provider: "google",
          maps_query: "Gyokusen-inmaru Garden"
        });
      } else if (item.attivita.includes("Curio Espresso")) {
        newItems.push({
          ...item,
          ora: "09:45",
          ora_fine: "10:45"
        });
      } else {
        newItems.push(item);
      }
    });

    dayTodos = [
      { testo: "Presentarsi al 21st Century Museum alle 15:00 esibendo l'e-ticket con ID 160760XS1250", fatto: false }
    ];

    return {
      ...g,
      titolo: "Kanazawa Castle, Gyokusen-inmaru & Arte Contemporanea",
      focus: "Kenroku-en, Gyokusen-inmaru, D.T. Suzuki Museum, 21st Century Museum",
      vibe: "Natura imperiale, specchi d'acqua riflettenti e architettura zen d'avanguardia",
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  // Giorno 15 (12 Agosto - Takayama)
  if (g.giorno === 15) {
    dayTodos = [
      { testo: "Richiedere il biglietto da visita del Takayama Ouan con l'indirizzo scritto in giapponese", fatto: false },
      { testo: "Presentarsi da Maruaki o Ajikura Tengoku a Takayama entro le 17:30-17:45 per iscriversi in lista d'attesa per la cena Hida Beef", fatto: false },
      { testo: "Prenotare alla reception del Takayama Ouan una delle 3 vasche termali private (kashikiri) sul tetto per chi ha tatuaggi", fatto: false }
    ];
  }

  // Giorno 16 (13 Agosto)
  if (g.giorno === 16) {
    const newItems = g.tabella_oraria.map(item => {
      if (item.attivita.includes("Higashiyama")) {
        return {
          ...item,
          attivita: "Higashiyama Walking Course (OPZIONALE / FACOLTATIVO)",
          dettagli: "⚠️ Percorso templi collinare immerso nella foresta. STRETTAMENTE OPZIONALE: se l'umidità supera l'80% o la stanchezza si fa sentire, optare per relax termale ed aria condizionata in hotel"
        };
      }
      return item;
    });

    dayTodos = [
      { testo: "Valutare la temperatura ed umidità prima di intraprendere l'escursione Higashiyama (mantenere facoltativa)", fatto: false }
    ];

    return {
      ...g,
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  // Giorno 17 (14 Agosto - Gujo)
  if (g.giorno === 17) {
    const newItems = g.tabella_oraria.map(item => {
      if (item.attivita.includes("Trasferimento a Gujo Hachiman")) {
        return {
          ...item,
          dettagli: "Trenino Nagaragawa Railway da Fukado a Gujo Hachiman (~15 min). ⚠️ REGOLE FERROVIA: NON accetta Suica/Pasmo/carte. Pagamento SOLO IN CONTANTI/MONETE. Fotografare subito orari treni speciali notturni."
        };
      }
      return item;
    });

    dayTodos = [
      { testo: "Richiedere l'indirizzo / biglietto da visita della Jeenie's Inn Fukado in giapponese per i trasferimenti", fatto: false },
      { testo: "Cambiare banconote grandi da ¥10.000 in tagli piccoli da ¥1.000 e monete nei minimarket per le yatai", fatto: false },
      { testo: "Assicurarsi di avere solo contanti/monete in tasca per il biglietto del treno Nagaragawa Railway (NO Suica/carte)", fatto: false },
      { testo: "Fotografare subito in stazione a Gujo Hachiman i tabelloni con gli orari dei treni notturni speciali di rientro a Fukado", fatto: false },
      { testo: "Applicare cerotti protettivi in silicone tra l'alluce e il secondo dito prima di indossare i geta in legno", fatto: false }
    ];

    return {
      ...g,
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  // Giorno 18 (15 Agosto)
  if (g.giorno === 18) {
    dayTodos = [
      { testo: "Far prenotare a Jeenie un taxi privato per l'indomani mattina alle 10:30 verso Gujo IC (zona Fukado senza taxi a chiamata)", fatto: false }
    ];
  }

  // Giorno 19 (16 Agosto - Osaka)
  if (g.giorno === 19) {
    dayTodos = [
      { testo: "Richiedere il biglietto da visita dell'Hotel S-Presso West di Osaka alla reception con l'indirizzo scritto in giapponese", fatto: false },
      { testo: "Ricordarsi di usare NAVITIME per la navigazione sui mezzi pubblici ad Osaka e Kansai!", fatto: false }
    ];
  }

  // Giorno 20 (17 Agosto)
  if (g.giorno === 20) {
    dayTodos = [
      { testo: "Prendere l'autobus dal terminal di Kintetsu-Nara per Kasuga Taisha per evitare la salita a piedi di 40 minuti", fatto: false },
      { testo: "Acquistare integratori isotonici (Pocari Sweat/Aquarius) alle macchinette prima di addentrarsi nella foresta di Kasugayama", fatto: false }
    ];
  }

  // Giorno 21 (18 Agosto)
  if (g.giorno === 21) {
    dayTodos = [
      { testo: "Verificare gli orari del tramonto a Osaka per salire ad Abeno Harukas con 30 minuti di anticipo", fatto: false }
    ];
  }

  // Giorno 22 (19 Agosto)
  if (g.giorno === 22) {
    const newItems = [];
    g.tabella_oraria.forEach(item => {
      if (item.attivita.includes("Namba Yasaka")) {
        newItems.push(item);
      } else if (item.attivita.includes("Kuromon") || item.attivita.includes("Sumiyoshi")) {
        newItems.push(item);
      } else if (item.attivita.includes("Waterfront") || item.attivita.includes("Den Den Town")) {
        newItems.push({
          ora: "11:30",
          ora_fine: "15:30",
          tipo: "attivita",
          attivita: "Orange Street (Minami-Horie) & Den Den Town",
          dettagli: "Gemma Integrata: mecca del design d'interni, boutique di ricerca indipendente, caffè specialty a 10 min da casa + retrogaming a Den Den Town",
          maps_provider: "google",
          maps_query: "Orange Street Minami Horie Osaka"
        });
      } else if (item.attivita.includes("Rientro in hotel")) {
        newItems.push({
          ...item,
          ora: "15:30",
          ora_fine: "17:15"
        });
      } else if (item.attivita.includes("CENA D'ADDIO")) {
        newItems.push({
          ora: "17:15",
          ora_fine: "19:15",
          tipo: "attivita",
          attivita: "Shinsekai & Janjan Yokocho",
          dettagli: "Gemma Integrata (Quartiere Nostalgico Showa): atmosfera anni '50, torre Tsutenkaku e vicoli retrò di Janjan Yokocho",
          maps_provider: "google",
          maps_query: "Shinsekai Osaka"
        });
        newItems.push({
          ora: "19:30",
          ora_fine: "21:30",
          tipo: "pasto",
          attivita: "Cena D'Addio Osaka (Kushikatsu a Shinsekai)",
          dettagli: "Spiedini fritti Kushikatsu in taverna tipica a Shinsekai / Janjan Yokocho o tavolo riservato su Tabelog a Namba",
          maps_provider: "google",
          maps_query: "Janjan Yokocho Kushikatsu"
        });
      } else {
        newItems.push(item);
      }
    });

    dayTodos = [
      { testo: "Chiudere gli zaini e preparare i documenti di viaggio e i passaporti per il trasferimento all'alba di domani", fatto: false }
    ];

    return {
      ...g,
      titolo: "Tempio del Leone, Orange Street Design & Shinsekai Retrò",
      focus: "Namba Yasaka, Sumiyoshi Taisha o Kuromon, Orange Street (Pomeriggio), Shinsekai & Janjan Yokocho (Sera)",
      vibe: "Teste di leone, boutique di ricerca, ponti rossi, canali Showa e atmosfere anni '50",
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  // Giorno 23 (20 Agosto)
  if (g.giorno === 23) {
    const newItems = [
      {
        ora: "04:30",
        tipo: "info",
        attivita: "Sveglia Rigorosa",
        dettagli: "Preparazione finale bagaglio a mano. Zero power bank nei bagagli."
      },
      {
        ora: "04:55",
        tipo: "alloggio",
        attivita: "Check-out Hotel S-Presso West",
        dettagli: "Camminata a piedi di 3 min verso la stazione Nankai di Namba."
      },
      {
        ora: "05:05",
        tipo: "info",
        attivita: "Binario 6 Stazione Namba",
        dettagli: "Raggiungimento binario 6 (Linea Nankai). Usare la Suica/ICOCA."
      },
      {
        ora: "05:15",
        tipo: "trasporto",
        attivita: "Nankai Airport Express (05:15 -> 05:59)",
        dettagli: "Partenza treno Airport Express diretto per KIX (No Rapi:t). Arrivo ore 05:59."
      },
      {
        ora: "06:05",
        tipo: "compito",
        attivita: "Check-in Air China KIX T1",
        dettagli: "Area F (Livello 4). Banchi Air China, ritiro carte d'imbarco e Thru-Check FCO."
      },
      {
        ora: "09:05",
        ora_fine: "11:25",
        tipo: "trasporto",
        attivita: "Volo CA 162 (Osaka KIX -> Pechino PEK)",
        dettagli: "Durata 3h 20m. Atterraggio a PEK Terminal 3-E."
      },
      {
        ora: "11:25",
        ora_fine: "13:20",
        tipo: "trasporto",
        attivita: "Transito Stretto PEK T3-E (1h 55m)",
        dettagli: "Seguire cartelli blu International Transfer. Varchi di sicurezza rapidi senza batterie al litio."
      },
      {
        ora: "13:20",
        ora_fine: "18:30",
        tipo: "trasporto",
        attivita: "Volo CA 939 (Pechino PEK -> Roma FCO)",
        dettagli: "Durata 11h 10m. Arrivo a Roma FCO ore 18:30."
      }
    ];

    dayTodos = [
      { testo: "Controllare che NON ci siano Power Bank nei bagagli a mano o stivati per azzerare i controlli a Pechino PEK", fatto: false },
      { testo: "Richiedere ai banchi Air China di KIX l'adesivo Priority Connection / Tight Transit sul bagaglio a mano", fatto: false }
    ];

    return {
      ...g,
      titolo: "Volo di Rientro (KIX ➔ PEK ➔ FCO)",
      tabella_oraria: newItems,
      todo_list: dayTodos
    };
  }

  return {
    ...g,
    todo_list: dayTodos
  };
});

fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ File viaggio-2026-v5.json rigenerato con TUTTI gli 8 protocolli ufficiali completi!`);
