import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../config';

/**
 * Main dashboard page for SunTrace AI.
 * Handles:
 * - Uploading rooftop image + GPS location
 * - Sending data to backend for verification
 * - Displaying latest verification result
 * - Showing verification history table
 */
function Dashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch verification history from backend
  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch(`${BACKEND_URL}/api/history`);
      if (!res.ok) {
        throw new Error('Failed to load history');
      }
      const json = await res.json();
      if (json.success) {
        setHistory(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Generic helper to download a PDF report for a given verification id
  const downloadReport = async (id) => {
    try {
      setIsDownloading(true);
      const res = await fetch(`${BACKEND_URL}/api/report/${id}`);
      if (!res.ok) {
        throw new Error('Failed to download report');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SunTraceAI_Report_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Unable to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle verification form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      setError('Please select an image to upload.');
      return;
    }

    if (!latitude || !longitude) {
      setError('Please provide both latitude and longitude.');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    try {
      setIsSubmitting(true);

      const res = await fetch(`${BACKEND_URL}/api/verify`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Verification request failed');
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Verification failed');
      }

      setCurrentResult(json.data);

      // Refresh history list after successful verification
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while verifying.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString();
  };

  const formatPercentage = (value) => {
    if (typeof value !== 'number') return '-';
    return `${(value * 100).toFixed(1)}%`;
  };

  const verdictBadgeClasses = (verdict) => {
    if (verdict === 'Eligible') {
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40';
    }
    return 'bg-amber-500/15 text-amber-300 border border-amber-400/40';
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold mb-2 text-slate-50 text-center">
        Verification Dashboard
      </h1>
      <h2 className="text-center text-gray-500 text-md mb-8">
        Deepfake-proof rooftop solar subsidy verification
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Form Card */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-500/10">
          <h3 className="text-lg font-semibold mb-4 text-slate-100">
            Upload rooftop image
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Provide a rooftop image and GPS coordinates. SunTrace AI will run a
            mock verification to estimate solar eligibility.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500/90 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:file:bg-emerald-400/90 cursor-pointer"
              />
              <p className="text-xs text-slate-500">
                Supported formats: JPEG, JPG, PNG.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Latitude
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 28.6139"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/60"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Longitude
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., 77.2090"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/60"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70 transition-colors w-full"
            >
              {isSubmitting ? 'Verifying...' : 'Run Verification'}
            </button>
          </form>
        </section>

        {/* Results Card */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-500/10 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-100">
            Verification result
          </h3>

          {!currentResult ? (
            <p className="text-sm text-slate-500">
              No verification run yet. Submit an image and location to see the
              result here.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Verdict</span>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${currentResult.verdict === 'Eligible' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}
                >
                  {currentResult.verdict}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-400">Solar detected</dt>
                  <dd className="font-medium text-slate-100">
                    {currentResult.solarDetected ? 'Yes' : 'No'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">GPS match</dt>
                  <dd className="font-medium text-slate-100">
                    {currentResult.gpsMatch ? 'Yes' : 'No'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Panel count</dt>
                  <dd className="font-medium text-slate-100">
                    {currentResult.panelCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Estimated capacity</dt>
                  <dd className="font-medium text-slate-100">
                    {currentResult.capacityKW?.toFixed
                      ? currentResult.capacityKW.toFixed(2)
                      : currentResult.capacityKW}{' '}
                    kW
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Fake Risk Score</dt>
                  <dd className="font-medium text-slate-100">
                    {typeof currentResult.fakeScore === 'number'
                      ? `${(currentResult.fakeScore * 100).toFixed(2)}%`
                      : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Created at</dt>
                  <dd className="font-medium text-slate-100">
                    {formatDate(currentResult.createdAt)}
                  </dd>
                </div>
              </dl>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => downloadReport(currentResult._id)}
                  disabled={isDownloading}
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-500/60 bg-slate-950/40 px-4 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isDownloading
                    ? 'Preparing report...'
                    : 'Download Verification Report'}
                </button>
              </div>
            </div>
          )}

          {/* History section */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-200">
                Verification history
              </h4>
              {isLoadingHistory && (
                <span className="text-xs text-slate-500">Loading…</span>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500">
                No verifications yet. They will appear here once you start
                running checks.
              </p>
            ) : (
              <div className="max-h-64 overflow-auto rounded-xl border border-slate-800/60 bg-slate-950/40">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Panels
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Capacity (kW)
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Verdict</th>
                      <th className="px-3 py-2 text-left font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {history.map((item) => (
                      <tr key={item._id}>
                        <td className="px-3 py-2 align-top">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {item.panelCount}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {item.capacityKW?.toFixed
                            ? item.capacityKW.toFixed(2)
                            : item.capacityKW}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                              item.verdict === 'Eligible'
                                ? 'bg-green-500 text-white'
                                : 'bg-yellow-500 text-black'
                            }`}
                          >
                            {item.verdict}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top text-right">
                          <button
                            type="button"
                            onClick={() => downloadReport(item._id)}
                            className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;


