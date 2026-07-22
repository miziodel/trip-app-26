import React, { useEffect } from 'react';
import { useViaggioStore } from './store/store';
import { TopBar } from './components/layout/TopBar';
import { BottomNav } from './components/layout/BottomNav';
import { Toast } from './components/ui/Toast';
import { TaxiCard } from './components/ui/TaxiCard';
import { CurrencyModal } from './components/ui/CurrencyModal';
import { TodoDrawer } from './components/ui/TodoDrawer';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { OggiTab } from './tabs/Oggi';
import { ItinerarioTab } from './tabs/Itinerario';
import { TrasportiTab } from './tabs/Trasporti';
import { GuidaTab } from './tabs/Guida';
import { EmergenzeTab } from './tabs/Emergenze';

export const App: React.FC = () => {
  const data = useViaggioStore((state) => state.data);
  const activeTab = useViaggioStore((state) => state.activeTab);
  const isLoading = useViaggioStore((state) => state.isLoading);
  const loadInitialData = useViaggioStore((state) => state.loadInitialData);

  useEffect(() => {
    // Only load from IndexedDB. If empty, data will be null and WelcomeScreen will render.
    loadInitialData();
  }, [loadInitialData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-amber-400 flex flex-col justify-center items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wider uppercase">Caricamento Viaggio Corea & Giappone...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <>
        <WelcomeScreen />
        <Toast />
      </>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'oggi':
        return <OggiTab />;
      case 'itinerario':
        return <ItinerarioTab />;
      case 'trasporti':
        return <TrasportiTab />;
      case 'guida':
        return <GuidaTab />;
      case 'emergenze':
        return <EmergenzeTab />;
      default:
        return <OggiTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      <TopBar />
      <main className="max-w-md mx-auto">{renderActiveTab()}</main>
      <BottomNav />

      {/* Global Modals & Overlays */}
      <TaxiCard />
      <CurrencyModal />
      <TodoDrawer />
      <Toast />
    </div>
  );
};

export default App;
