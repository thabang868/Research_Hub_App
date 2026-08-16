import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPapers } from '../api/graph';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user, logout, subscription } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [techNews, setTechNews] = useState([]);
  const [loadingTechNews, setLoadingTechNews] = useState(true);
  const [trendingPapers, setTrendingPapers] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [toast, setToast] = useState(null);

  // Show trial welcome toast on first signin
  useEffect(() => {
    const showToast = sessionStorage.getItem('show_trial_toast');
    if (showToast) {
      sessionStorage.removeItem('show_trial_toast');
      const hours = subscription?.expires_at
        ? Math.max(0, Math.ceil((new Date(subscription.expires_at) - new Date()) / (1000 * 60 * 60)))
        : 24;
      setToast({
        message: `Welcome! You have ${hours} hours of free access. Explore everything ResearchHub has to offer.`,
        type: 'trial',
      });
      setTimeout(() => setToast(null), 3000);
    }
  }, [subscription]);

  useEffect(() => {
    if (!user?.id) return;

    getUserPapers(user.id)
      .then((data) => setPapers(data.papers || []))
      .catch(() => setPapers([]))
      .finally(() => setLoadingPapers(false));

    // Fetch live data every 30s (backend caches, no rate limit issue)
    const fetchLive = () => {
      fetch('/api/trending/live')
        .then((r) => r.json())
        .then((d) => {
          setTechNews(d.articles || []);
          setTrendingPapers(d.trendingPapers || []);
        })
        .catch(() => {})
        .finally(() => {
          setLoadingTechNews(false);
          setLoadingTrending(false);
        });
    };

    fetchLive();
    const interval = setInterval(fetchLive, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Rotation index — cycles every 10 seconds to show different items
  const [rotationIndex, setRotationIndex] = useState(0);

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setRotationIndex((prev) => prev + 1);
    }, 10000); // Rotate every 10 seconds
    return () => clearInterval(rotateInterval);
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diff = Math.floor((new Date() - d) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  // Build a large pool of all items, then rotate which 6 are shown every 10s
  const allNews = techNews.map((a) => ({ type: 'news', ...a }));
  const allResearch = trendingPapers.map((p) => ({ type: 'paper', ...p }));
  const allItems = [];
  const maxLen = Math.max(allNews.length, allResearch.length);
  for (let i = 0; i < maxLen; i++) {
    if (allNews[i]) allItems.push(allNews[i]);
    if (allResearch[i]) allItems.push(allResearch[i]);
  }

  // Show 6 items, rotating through the pool
  const itemsToShow = 6;
  const liveFeed = [];
  if (allItems.length > 0) {
    for (let i = 0; i < Math.min(itemsToShow, allItems.length); i++) {
      const idx = (rotationIndex * 2 + i) % allItems.length;
      // Avoid duplicates in the current view
      const item = allItems[idx];
      if (!liveFeed.some((f) => f.title === item.title)) {
        liveFeed.push(item);
      }
    }
    // Fill remaining slots if dedup removed some
    if (liveFeed.length < itemsToShow) {
      for (const item of allItems) {
        if (liveFeed.length >= itemsToShow) break;
        if (!liveFeed.some((f) => f.title === item.title)) {
          liveFeed.push(item);
        }
      }
    }
  }

  const isLiveLoading = loadingTechNews || loadingTrending;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar current="Dashboard" />

      {/* Trial Welcome Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <div className="flex items-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl shadow-2xl shadow-gray-900/30 border border-gray-700 max-w-lg">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">Free Trial Active</p>
              <p className="text-xs text-gray-300 mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <main className="px-4 sm:px-10 lg:px-20 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name || 'Researcher'}</h1>
          <p className="text-gray-500 text-sm sm:text-base mb-8 sm:mb-10">Your all-in-one research dashboard bringing together papers, datasets, AI-driven insights, and deep analysis in one powerful workspace.</p>

          {/* Action Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-12">
            <DashCard title="Search Papers" description="250M+ papers from OpenAlex, PubMed, CORE, CrossRef & more" count={`${papers.length} saved`} onClick={() => navigate('/search/papers')}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>} />
            <DashCard title="Datasets" description="Discover datasets from Hugging Face, World Bank, NASA & more" count="Live" onClick={() => navigate('/search/datasets')}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75m16.5 3.75v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" /></svg>} />
            <DashCard title="Deep Analysis" description="Explore intelligent paper analysis, summaries, and research insights" count="New" onClick={() => navigate('/deep-analysis')}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>} highlight />
            <DashCard title="AI Assistant" description="Summarize papers, suggest methods & find research gaps" count="Try" onClick={() => navigate('/ai')}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>} />
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Saved Papers */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Search related papers</h2>
              {loadingPapers ? (
                <Loader />
              ) : papers.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-100 shadow-lg shadow-gray-200/50 text-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">No saved papers yet.</p>
                  <p className="text-gray-300 text-xs mt-1 mb-4">Search and save papers to build your knowledge graph.</p>
                  <button onClick={() => navigate('/search/papers')} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg shadow-gray-900/25 hover:bg-gray-800 transition-all cursor-pointer">
                    Search Papers
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {papers.slice(0, 5).map((paper, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{paper.title}</h3>
                      {paper.authors?.length > 0 && <p className="text-xs text-gray-400 mb-2">{paper.authors.join(', ')}</p>}
                      {paper.abstract && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{paper.abstract}</p>}
                      {paper.keywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {paper.keywords.map((kw, j) => (
                            <span key={j} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {papers.length > 5 && (
                    <p className="text-center text-sm text-gray-400">+{papers.length - 5} more saved papers</p>
                  )}
                </div>
              )}

              {/* Deep Research Analysis Card */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Deep Research Analysis</h2>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-md mb-5">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Intelligent Paper Analysis</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      AI that reads and understands research papers, summarizes key contributions, and highlights what is truly new or innovative.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">AI-Powered Summaries</span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">Novelty Detection</span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">Cross-Paper Connections</span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">Knowledge Graph</span>
                    </div>
                    <button onClick={() => navigate('/deep-analysis')}
                      className="w-full py-3.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-lg shadow-gray-900/25 hover:bg-gray-800 hover:shadow-xl transition-all cursor-pointer">
                      Start Deep Analysis
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar — Live AI & Tech News + Trending Research */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                AI News
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">Live</span>
              </h2>

              {isLiveLoading ? (
                <Loader />
              ) : liveFeed.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-200/50">
                  <p className="text-sm text-gray-400 text-center">No live data available.</p>
                </div>
              ) : (
                <div className="space-y-3 transition-all duration-500">
                  {liveFeed.map((item, i) => (
                    <a
                      key={`${rotationIndex}-${item.title?.slice(0, 30)}-${i}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white rounded-xl border border-gray-100 shadow-md shadow-gray-200/30 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
                    >
                      {/* Show image for first news item */}
                      {item.type === 'news' && item.image && i < 2 && (
                        <img src={item.image} alt="" className="w-full h-28 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          {item.type === 'news' ? (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded border border-blue-100">AI News</span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-violet-50 text-violet-600 text-[10px] font-bold uppercase rounded border border-violet-100">Research</span>
                          )}
                          {item.type === 'paper' && item.citations > 0 && (
                            <span className="text-[10px] text-gray-400">{item.citations.toLocaleString()} citations</span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{item.title}</h3>
                        {item.description && item.type === 'news' && (
                          <p className="text-xs text-gray-500 line-clamp-1 mb-1.5">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{item.source}</span>
                          {item.publishedAt && (
                            <>
                              <span>&middot;</span>
                              <span>{formatTime(item.publishedAt)}</span>
                            </>
                          )}
                          {item.year && (
                            <>
                              <span>&middot;</span>
                              <span>{item.year}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashCard({ title, description, count, icon, onClick, highlight }) {
  return (
    <div onClick={onClick} className={`bg-white rounded-2xl p-4 sm:p-6 border shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer ${
      highlight ? 'border-violet-200 hover:shadow-violet-300/50 hover:border-violet-300' : 'border-gray-200 hover:shadow-gray-300/60 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border ${
          highlight ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-gray-50 text-gray-600 border-gray-100'
        }`}>{icon}</div>
        <span className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${
          highlight ? 'text-violet-500' : 'text-gray-400'
        }`}>{count}</span>
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">{description}</p>
    </div>
  );
}

function Loader() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50 text-center">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
    </div>
  );
}
