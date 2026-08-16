import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { savePaper } from '../api/graph';
import Navbar from '../components/Navbar';

export default function SearchPapers() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [saving, setSaving] = useState({});
  const [total, setTotal] = useState(0);
  const [sourceCounts, setSourceCounts] = useState({});

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search/multi?q=${encodeURIComponent(query)}&limit=50`);
      const data = await res.json();
      setPapers(data.papers || []);
      setTotal(data.total || 0);
      setSourceCounts(data.sources || {});
    } catch {
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (paper) => {
    setSaving((s) => ({ ...s, [paper.id]: true }));
    try {
      await savePaper({
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        source: paper.source,
        url: paper.url,
        keywords: paper.fields,
        userId: user.id,
      });
      setSaving((s) => ({ ...s, [paper.id]: 'saved' }));
    } catch {
      setSaving((s) => ({ ...s, [paper.id]: false }));
    }
  };

  const getSourceColor = (source) => {
    const colors = {
      'OpenAlex': 'bg-gray-50 text-gray-700 border-gray-200',
      'CrossRef': 'bg-blue-50 text-blue-700 border-blue-200',
      'PubMed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'CORE': 'bg-orange-50 text-orange-700 border-orange-200',
      'ScienceDirect': 'bg-amber-50 text-amber-700 border-amber-200',
      'Semantic Scholar': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'arXiv': 'bg-red-50 text-red-700 border-red-200',
      'IEEE Xplore': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    };
    return colors[source] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar current="Papers" />

      <main className="px-4 sm:px-10 lg:px-20 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Search Papers</h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Search 250M+ research papers across PubMed, CORE, ScienceDirect, ResearchGate, OpenAlex, CrossRef, arXiv & more.</p>

          {/* Search Bar */}
          <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex gap-2 sm:gap-3 mb-8 sm:mb-10">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. machine learning, climate change, NLP transformers..."
              className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 sm:px-6 py-3 sm:py-3.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-lg shadow-gray-900/25 hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Search'}
            </button>
          </form>

          {/* Results */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-3">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              <p className="text-xs sm:text-sm text-gray-400 text-center px-4">Searching OpenAlex, CrossRef, PubMed, CORE, ScienceDirect, arXiv, IEEE & Semantic Scholar simultaneously...</p>
            </div>
          )}

          {!loading && searched && papers.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <p className="text-gray-400">No papers found. Try a different search term.</p>
            </div>
          )}

          {!loading && papers.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
                <p className="text-sm text-gray-400">{total.toLocaleString()} results found</p>
                {Object.keys(sourceCounts).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(sourceCounts).map(([src, count]) => (
                      <span key={src} className={`px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs rounded-full border ${getSourceColor(src)}`}>
                        {src}: {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3 sm:space-y-4">
                {papers.map((paper) => (
                  <div key={paper.id} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/70 transition-all">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-2">
                            {paper.title}
                          </a>
                          {paper.openAccess && (
                            <span className="shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded-full border border-emerald-200 hidden sm:inline">
                              Open Access
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-1">
                          {paper.authors?.length > 0 && (
                            <span className="text-xs text-gray-400">{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ` +${paper.authors.length - 3}` : ''}</span>
                          )}
                          {paper.year && <span className="text-xs text-gray-300 hidden sm:inline">|</span>}
                          {paper.year && <span className="text-xs text-gray-400">{paper.year}</span>}
                          {paper.citations > 0 && <span className="text-xs text-gray-300 hidden sm:inline">|</span>}
                          {paper.citations > 0 && <span className="text-xs text-gray-400">{paper.citations.toLocaleString()} citations</span>}
                          <span className="text-xs text-gray-300">|</span>
                          <span className={`px-2 py-0.5 text-[10px] rounded-full border font-medium ${getSourceColor(paper._from || paper.source)}`}>
                            {paper._from || paper.source}
                          </span>
                        </div>
                        {paper.abstract && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-3 leading-relaxed">{paper.abstract}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:mt-3">
                          {paper.fields?.slice(0, 3).map((f, i) => (
                            <span key={i} className="px-2 sm:px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] sm:text-xs rounded-full">{f}</span>
                          ))}
                          {paper.pdfUrl && (
                            <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="px-2 sm:px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] sm:text-xs rounded-full border border-blue-200 hover:bg-blue-100 transition-colors">
                              PDF
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSave(paper)}
                        disabled={saving[paper.id] === true || saving[paper.id] === 'saved'}
                        className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed ${
                          saving[paper.id] === 'saved'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-gray-900 text-white shadow-md hover:bg-gray-800'
                        }`}
                      >
                        {saving[paper.id] === true ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : saving[paper.id] === 'saved' ? 'Saved' : 'Save'}
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
