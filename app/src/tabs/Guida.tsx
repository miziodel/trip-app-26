import React, { useState } from 'react';
import { useViaggioStore } from '../store/store';
import { CopyableText } from '../components/ui/CopyableText';
import {
  BookOpen,
  Volume2,
  Flame,
  Utensils,
  Plane,
  Footprints,
  Sparkles,
} from 'lucide-react';
import type { Frase } from '../types/viaggio';

export const DEFAULT_FRASARIO: Frase[] = [
  // Cortesia (8)
  { categoria: 'Cortesia', it: 'Buongiorno (mattina)', jp: 'おはようございます', pronuncia: 'Ohayō gozaimasu', kr: '안녕하세요', kr_pronuncia: 'Annyeonghaseyo' },
  { categoria: 'Cortesia', it: 'Buongiorno / Buonasera (giorno)', jp: 'こんにちは', pronuncia: 'Konnichiwa', kr: '안녕하세요', kr_pronuncia: 'Annyeonghaseyo' },
  { categoria: 'Cortesia', it: 'Buonasera (sera)', jp: 'こんばんは', pronuncia: 'Konbanwa', kr: '안녕하세요', kr_pronuncia: 'Annyeonghaseyo' },
  { categoria: 'Cortesia', it: 'Grazie (educato)', jp: 'ありがとうございます', pronuncia: 'Arigatō gozaimasu', kr: '감사합니다', kr_pronuncia: 'Gamsahamnida' },
  { categoria: 'Cortesia', it: 'Mi scusi / Permesso', jp: 'すみません', pronuncia: 'Sumimasen', kr: '실례합니다', kr_pronuncia: 'Sillyehamnida' },
  { categoria: 'Cortesia', it: 'Prego / Di niente', jp: 'どういたしまして', pronuncia: 'Dō itashimashite', kr: '천만에요', kr_pronuncia: 'Cheonmaneyo' },
  { categoria: 'Cortesia', it: 'Arrivederci', jp: 'さようなら', pronuncia: 'Sayōnara', kr: '안녕히 계세요', kr_pronuncia: 'Annyeonghi gyeseyo' },
  { categoria: 'Cortesia', it: 'Sì / No', jp: 'はい / いいえ', pronuncia: 'Hai / Iie', kr: '네 / 아니요', kr_pronuncia: 'Ne / Aniyo' },

  // Cibo (8)
  { categoria: 'Cibo', it: 'Il conto, per favore', jp: 'お会計お願いします', pronuncia: 'Okaikei onegaishimasu', kr: '계산해 주세요', kr_pronuncia: 'Gyesanhae juseyo' },
  { categoria: 'Cibo', it: 'Questo, per favore', jp: 'これをください', pronuncia: 'Kore o kudasai', kr: '이것 주세요', kr_pronuncia: 'Igeot juseyo' },
  { categoria: 'Cibo', it: 'Acqua, per favore', jp: 'お水をください', pronuncia: 'Omizu o kudasai', kr: '물 주세요', kr_pronuncia: 'Mul juseyo' },
  { categoria: 'Cibo', it: 'Delizioso!', jp: 'おいしい！', pronuncia: 'Oishii!', kr: '맛있어요!', kr_pronuncia: 'Masisseoyo!' },
  { categoria: 'Cibo', it: 'Menu in inglese, per favore', jp: '英語のメニューはありますか？', pronuncia: 'Eigo no menyū wa arimasu ka?', kr: '영어 메뉴판 있나요?', kr_pronuncia: 'Yeongeot menyupan innayo?' },
  { categoria: 'Cibo', it: 'Buon appetito!', jp: 'いただきます！', pronuncia: 'Itadakimasu!', kr: '잘 먹겠습니다!', kr_pronuncia: 'Jal meokgetseumnida!' },
  { categoria: 'Cibo', it: 'Non posso mangiare carne/piccante', jp: '肉/辛いものは食べられません', pronuncia: 'Niku/Karai mono wa taberaremasen', kr: '고기/매운 것 못 먹어요', kr_pronuncia: 'Gogi/Maeun geot mot meogeoyo' },
  { categoria: 'Cibo', it: 'Un altro, per favore', jp: 'もうひとつください', pronuncia: 'Mō hitotsu kudasai', kr: '하나 더 주세요', kr_pronuncia: 'Hana deo juseyo' },

  // Trasporti (8)
  { categoria: 'Trasporti', it: "Dov'è la stazione?", jp: '駅はどこですか？', pronuncia: 'Eki wa doko desu ka?', kr: '역이 어디예요?', kr_pronuncia: 'Yeogi eodiyeyo?' },
  { categoria: 'Trasporti', it: "Dov'è il bagno?", jp: 'トイレはどこですか？', pronuncia: 'Toire wa doko desu ka?', kr: '화장실이 어디예요?', kr_pronuncia: 'Hwajangsiri eodiyeyo?' },
  { categoria: 'Trasporti', it: 'Quanto costa?', jp: 'いくらですか？', pronuncia: 'Ikura desu ka?', kr: '얼마예요?', kr_pronuncia: 'Eolmayeyo?' },
  { categoria: 'Trasporti', it: 'Va a [nome luogo]?', jp: '[場所]に行きますか？', pronuncia: '[Basho] ni ikimasu ka?', kr: '[장소]에 가나요?', kr_pronuncia: '[Jangso]e ganayo?' },
  { categoria: 'Trasporti', it: 'Mi porti a questo indirizzo (Taxi)', jp: 'この住所までお願いします', pronuncia: 'Kono jūsho made onegaishimasu', kr: '이 주소로 가주세요', kr_pronuncia: 'I jusoro gajuseyo' },
  { categoria: 'Trasporti', it: 'Fermi qui, per favore', jp: 'ここで止めてください', pronuncia: 'Koko de tomete kudasai', kr: '여기서 세워주세요', kr_pronuncia: 'Yeogiseo sewojuseyo' },
  { categoria: 'Trasporti', it: 'Biglietto unico per favore', jp: '片道切符を一枚お願いします', pronuncia: 'Katamichi kippu o ichimai onegaishimasu', kr: '편도 티ケット 한 장 주세요', kr_pronuncia: 'Pyeondo tiket han jang juseyo' },
  { categoria: 'Trasporti', it: "Dov'è la fermata dell'autobus?", jp: 'バス停はどこですか？', pronuncia: 'Basutei wa doko desu ka?', kr: '버스 정류장이 어디예요?', kr_pronuncia: 'Beoseu jeongryujangi eodiyeyo?' },

  // Emergenze (6)
  { categoria: 'Emergenze', it: 'Aiuto!', jp: '助けて！', pronuncia: 'Tasukete!', kr: '도와주세요!', kr_pronuncia: 'Dowajuseyo!' },
  { categoria: 'Emergenze', it: 'Chiamate un medico', jp: '医者を呼んでください', pronuncia: 'Isha o yonde kudasai', kr: '의사를 불러주세요', kr_pronuncia: 'Uisareul bulleojuseyo' },
  { categoria: 'Emergenze', it: 'Chiamate la polizia', jp: '警察を呼んでください', pronuncia: 'Keisatsu o yonde kudasai', kr: '경찰을 불러주세요', kr_pronuncia: 'Gyeongchareul bulleojuseyo' },
  { categoria: 'Emergenze', it: 'Ho perso il mio portafoglio / passaporto', jp: '財布/パスポートをなくしました', pronuncia: 'Saifu/Pasupōto o nakushimashita', kr: '지갑/여권을 잃어버렸어요', kr_pronuncia: 'Jigap/Yeogwoneul ireobeoryeosseoyo' },
  { categoria: 'Emergenze', it: 'Non mi sento bene', jp: '気分が悪いです', pronuncia: 'Kibun ga warui desu', kr: '몸이 안 좋아요', kr_pronuncia: 'Momi an joayo' },
  { categoria: 'Emergenze', it: "Dov'è l'ospedale?", jp: '病院はどこですか？', pronuncia: 'Byōin wa doko desu ka?', kr: '병원이 어디예요?', kr_pronuncia: 'Byeongwoni eodiyeyo?' },
];

export const GuidaTab: React.FC = () => {
  const data = useViaggioStore((state) => state.data);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');
  const [selectedLanguage, setSelectedLanguage] = useState<'both' | 'jp' | 'kr'>('both');
  const [expandedProtocols, setExpandedProtocols] = useState<Record<string, boolean>>({
    onsen: false,
    monjayaki: false,
    pechino: false,
    geta: false,
  });

  if (!data) return null;

  const { protocolli } = data;
  const frasarioList = data.frasario && data.frasario.length >= 30 ? data.frasario : DEFAULT_FRASARIO;

  const categories = ['Tutti', 'Cortesia', 'Cibo', 'Trasporti', 'Emergenze'];

  const filteredFrasario = frasarioList.filter((frase) => {
    if (selectedCategory === 'Tutti') return true;
    return frase.categoria.toLowerCase() === selectedCategory.toLowerCase();
  });

  const toggleProtocol = (key: string) => {
    setExpandedProtocols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>Guida & Frasario</span>
        </h2>
        <p className="text-xs text-slate-400">Frasario essenziale Giapponese/Coreano e protocolli culturali</p>
      </div>

      {/* Anchor Navigation Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => scrollToElement('frasario')}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3 px-3 rounded-xl shadow-lg transition-all active:scale-95 text-xs sm:text-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>📖 Vai al Frasario</span>
        </button>

        <button
          type="button"
          onClick={() => scrollToElement('protocolli')}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold py-3 px-3 rounded-xl shadow-lg transition-all active:scale-95 text-xs sm:text-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>🎌 Vai ai Protocolli</span>
        </button>
      </div>

      {/* Cultural Protocols Section */}
      <div id="protocolli" className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Protocolli Culturali & Guide ⛩️</span>
        </h3>

        {/* Onsen Protocol */}
        {protocolli.onsen && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleProtocol('onsen')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <h4 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>{protocolli.onsen.titolo}</span>
              </h4>
              <span className="text-slate-400 font-bold text-sm">
                {expandedProtocols.onsen ? '▲' : '▼'}
              </span>
            </button>
            {expandedProtocols.onsen && (
              <div className="px-4 pb-4 space-y-3 pt-1 border-t border-slate-800/80">
                <ul className="space-y-2 text-xs text-slate-300">
                  {protocolli.onsen.regole?.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-amber-400 font-bold">{idx + 1}.</span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Monjayaki Protocol */}
        {protocolli.monjayaki && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleProtocol('monjayaki')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <h4 className="text-base font-bold text-orange-400 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-400" />
                <span>{protocolli.monjayaki.titolo}</span>
              </h4>
              <span className="text-slate-400 font-bold text-sm">
                {expandedProtocols.monjayaki ? '▲' : '▼'}
              </span>
            </button>
            {expandedProtocols.monjayaki && (
              <div className="px-4 pb-4 space-y-3 pt-1 border-t border-slate-800/80">
                <ol className="space-y-2 text-xs text-slate-300">
                  {protocolli.monjayaki.passaggi?.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-orange-400 font-bold">{idx + 1}.</span>
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Beijing Layover Protocol */}
        {protocolli.pechino_transito && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleProtocol('pechino')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <h4 className="text-base font-bold text-blue-400 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-400" />
                <span>{protocolli.pechino_transito.titolo}</span>
              </h4>
              <span className="text-slate-400 font-bold text-sm">
                {expandedProtocols.pechino ? '▲' : '▼'}
              </span>
            </button>
            {expandedProtocols.pechino && (
              <div className="px-4 pb-4 space-y-3 pt-1 border-t border-slate-800/80">
                <ul className="space-y-2 text-xs text-slate-300">
                  {protocolli.pechino_transito.istruzioni?.map((istr, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-blue-400 font-bold">•</span>
                      <span className="leading-relaxed">{istr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Geta Gujo Protocol */}
        {protocolli.geta_gujo && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleProtocol('geta')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <h4 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <Footprints className="w-5 h-5 text-emerald-400" />
                <span>{protocolli.geta_gujo.titolo}</span>
              </h4>
              <span className="text-slate-400 font-bold text-sm">
                {expandedProtocols.geta ? '▲' : '▼'}
              </span>
            </button>
            {expandedProtocols.geta && (
              <div className="px-4 pb-4 space-y-3 pt-1 border-t border-slate-800/80">
                <ul className="space-y-2 text-xs text-slate-300">
                  {protocolli.geta_gujo.consigli?.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phrasebook Section */}
      <div id="frasario" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-md pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Frasario Tascabile 🗣️ ({filteredFrasario.length} frasi)</span>
            </h3>
          </div>

          {/* Language Selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedLanguage('jp')}
              className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                selectedLanguage === 'jp'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇯🇵 Giapponese
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('kr')}
              className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                selectedLanguage === 'kr'
                  ? 'bg-sky-400 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇰🇷 Coreano
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('both')}
              className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                selectedLanguage === 'both'
                  ? 'bg-purple-500 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📖 Entrambe
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`py-1 px-3 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Phrase Cards */}
        <div className="space-y-3">
          {filteredFrasario.map((f, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{f.it}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                  {f.categoria}
                </span>
              </div>

              {/* Japanese */}
              {(selectedLanguage === 'both' || selectedLanguage === 'jp') && (
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">🇯🇵 Giapponese:</span>
                    <CopyableText text={f.jp} toastMessage="Frase Giapponese copiata!" className="text-amber-400 text-xs font-bold">
                      Copia 📋
                    </CopyableText>
                  </div>
                  <p className="text-base font-bold text-amber-300 font-mono">{f.jp}</p>
                  <p className="text-xs text-slate-300 italic">Pronuncia: {f.pronuncia}</p>
                </div>
              )}

              {/* Korean */}
              {(selectedLanguage === 'both' || selectedLanguage === 'kr') && f.kr && (
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">🇰🇷 Coreano:</span>
                    <CopyableText text={f.kr} toastMessage="Frase Coreana copiata!" className="text-blue-400 text-xs font-bold">
                      Copia 📋
                    </CopyableText>
                  </div>
                  <p className="text-base font-bold text-blue-300 font-mono">{f.kr}</p>
                  {f.kr_pronuncia && <p className="text-xs text-slate-300 italic">Pronuncia: {f.kr_pronuncia}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidaTab;
