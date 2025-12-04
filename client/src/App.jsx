import Dashboard from './pages/Dashboard.jsx';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="w-full border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-emerald-400/10 border border-emerald-400/40 flex items-center justify-center">
              <span className="text-emerald-300 text-xl font-semibold">☀️</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-tight">
                SunTrace AI – Rooftop Solar Verification
              </span>
              <span className="text-xs text-slate-400">
                Smart verification for solar-ready rooftops
              </span>
            </div>
          </div>
        </div>
      </nav>

      <Dashboard />

      <footer className="mt-10 pb-6 text-center text-gray-400 text-sm">
        Powered by SunTrace AI for Sustainable India
      </footer>
    </div>
  );
}

export default App;
