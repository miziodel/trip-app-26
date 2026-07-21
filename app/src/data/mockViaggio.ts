import type { ViaggioData } from '../types/viaggio';

export const mockViaggioData: ViaggioData = {
  meta: {
    titolo: "Viaggio Esempio 2026",
    versione: "1.0",
    passeggeri: ["Passeggero 1"],
    tassi_cambio: {
      JPY_EUR: 0.0062,
      KRW_EUR: 0.00068
    }
  },
  alloggi: [],
  trasporti: {
    voli: [],
    treni_e_bus: []
  },
  emergenze: {
    assicurazione: {
      compagnia: "Compagnia Esempio",
      polizza: "POL-000000",
      telefono_h24: "+39 000 000000"
    },
    corea: {
      polizia: "112",
      ambulanza: "119",
      hotline_turismo: "1330"
    },
    giappone: {
      polizia: "110",
      ambulanza: "119",
      hotline_jnto: "050-3816-2720"
    }
  },
  itinerario: [],
  protocolli: {},
  frasario: []
};
