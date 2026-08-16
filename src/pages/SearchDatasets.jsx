import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveDataset } from '../api/graph';
import Navbar from '../components/Navbar';

export default function SearchDatasets() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [saving, setSaving] = useState({});
  const [sourceCounts, setSourceCounts] = useState({});
  const [activeSource, setActiveSource] = useState('all');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setActiveSource('all');
    try {
      const res = await fetch(`/api/search/datasets?q=${encodeURIComponent(query)}&limit=50`);
      const data = await res.json();
      setDatasets(data.datasets || []);
      setSourceCounts(data.sources || {});
    } catch {
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (dataset) => {
    const key = dataset.id;
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      await saveDataset({
        title: dataset.title,
        source: dataset.source,
        url: dataset.url,
        keywords: dataset.keywords || [],
        userId: user.id,
      });
      setSaving((s) => ({ ...s, [key]: 'saved' }));
    } catch {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

  const getSourceColor = (source) => {
    const colors = {
      'Hugging Face': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'NASA': 'bg-blue-50 text-blue-700 border-blue-200',
      'World Bank': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Harvard Dataverse': 'bg-red-50 text-red-700 border-red-200',
      'Zenodo': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'PubMed GEO': 'bg-purple-50 text-purple-700 border-purple-200',
      'UCI ML Repository': 'bg-orange-50 text-orange-700 border-orange-200',
      'UCI Machine Learning Repository': 'bg-orange-50 text-orange-700 border-orange-200',
      'OpenAlex': 'bg-gray-50 text-gray-700 border-gray-200',
      'SADiLaR': 'bg-violet-50 text-violet-700 border-violet-200',
    };
    return colors[source] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const visibleDatasets = activeSource === 'all'
    ? datasets
    : datasets.filter((dataset) => (dataset._from || dataset.source) === activeSource);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar current="Datasets" />

      <main className="px-4 sm:px-10 lg:px-20 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Search Datasets</h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Discover datasets from Hugging Face, UCI Machine Learning Repository, World Bank, NASA, PubMed, Harvard Dataverse, Zenodo, OpenAlex, and SADiLaR language resources for NLP and linguistics.</p>

          {/* Search Bar */}
          <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex gap-2 sm:gap-3 mb-8 sm:mb-10">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. sentiment analysis, COVID-19, financial data, climate..."
              className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 sm:px-6 py-3 sm:py-3.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-lg shadow-gray-900/25 hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Search'}
            </button>
          </form>

          {/* Results */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-3">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              <p className="text-xs sm:text-sm text-gray-400 text-center">Searching Hugging Face, World Bank, NASA, PubMed, Harvard Dataverse, Zenodo & OpenAlex...</p>
            </div>
          )}

          {!loading && searched && datasets.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <p className="text-gray-400">No datasets found. Try a different search term.</p>
            </div>
          )}

          {!loading && datasets.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
                <p className="text-sm text-gray-400">
                  {activeSource === 'all' ? datasets.length : visibleDatasets.length} results shown
                </p>
                {Object.keys(sourceCounts).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveSource('all')}
                      className={`px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs rounded-full border cursor-pointer transition-all ${
                        activeSource === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      All sources: {datasets.length}
                    </button>
                    {Object.entries(sourceCounts).map(([src, count]) => (
                      <button
                        type="button"
                        key={src}
                        onClick={() => setActiveSource(src)}
                        aria-pressed={activeSource === src}
                        className={`px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs rounded-full border cursor-pointer transition-all ${getSourceColor(src)} ${
                          activeSource === src ? 'ring-2 ring-gray-900 ring-offset-1 font-semibold' : 'hover:brightness-95'
                        }`}
                      >
                        {src}: {count}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3 sm:space-y-4">
                {visibleDatasets.map((ds) => (
                  <div key={ds.id} className={`rounded-2xl p-4 sm:p-6 border shadow-lg transition-all ${
                    ds.source === 'SADiLaR' || ds._from === 'SADiLaR'
                      ? 'bg-violet-50/60 border-violet-200 shadow-violet-100/60 hover:shadow-violet-200/70'
                      : 'bg-white border-gray-100 shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/70'
                  }`}>
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <a
                            href={ds.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm sm:text-base font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-2"
                          >
                            {ds.title}
                          </a>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-1.5">
                          <span className={`px-2 py-0.5 text-[10px] sm:text-xs rounded-full border font-medium ${getSourceColor(ds._from || ds.source)}`}>
                            {ds._from || ds.source}
                          </span>
                          {ds.year && <span className="text-xs text-gray-400">{ds.year}</span>}
                          {ds.citations > 0 && <span className="text-xs text-gray-300">|</span>}
                          {ds.citations > 0 && <span className="text-xs text-gray-400">{ds.citations.toLocaleString()} {ds._from === 'Hugging Face' ? 'downloads' : 'citations'}</span>}
                        </div>
                        {ds.description && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{ds.description}</p>
                        )}
                        {ds.keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 sm:mt-3">
                            {ds.keywords.map((kw, i) => (
                              <span key={i} className="px-2 sm:px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] sm:text-xs rounded-full">{kw}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleSave(ds)}
                        disabled={saving[ds.id] === true || saving[ds.id] === 'saved'}
                        className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed ${
                          saving[ds.id] === 'saved'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-gray-900 text-white shadow-md hover:bg-gray-800'
                        }`}
                      >
                        {saving[ds.id] === true ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : saving[ds.id] === 'saved' ? 'Selected' : 'Choose'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
