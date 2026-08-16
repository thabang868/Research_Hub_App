import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="w-full px-4 sm:px-10 lg:px-20 py-4 sm:py-5 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs sm:text-sm">R</span>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
            RHub
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pricing')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm text-gray-600 font-medium hover:text-gray-900 transition-all cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg shadow-gray-900/25 hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/30 transition-all duration-200 cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-10 lg:px-20 py-12 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm mb-6 sm:mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-wide uppercase">
              AI-Powered Research Platform
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-4 sm:mb-6">
            Discover Research.
            <br />
            <span className="text-gray-400">Powered by Intelligence.</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-12">
            Find papers, datasets, and insights in one place. Run deep analysis on research, discover connections, and connect with scholarly sources worldwide.
          </p>

          <button
            onClick={() => navigate('/signin')}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white text-sm sm:text-base font-medium rounded-xl shadow-xl shadow-gray-900/20 hover:bg-gray-800 hover:shadow-2xl hover:shadow-gray-900/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            Begin Your Research
          </button>

          <p className="mt-4 text-xs sm:text-sm text-gray-400">
            Free 24-hour trial. Plans start at R10/day.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-16 sm:mt-20 max-w-6xl mx-auto w-full">
          <FeatureCard
            title="Research Papers"
            description="Search PubMed, CORE, ScienceDirect, arXiv, CrossRef, and more. Access millions of scholarly papers instantly."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            }
          />
          <FeatureCard
            title="Datasets"
            description="Discover datasets from Hugging Face, World Bank, NASA, UCI ML, Harvard Dataverse, and more."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
              </svg>
            }
          />
          <FeatureCard
            title="Deep Analysis"
            description="Unlock intelligent paper analysis, summaries, signal detection, and research insight generation."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            }
            isNew
          />
          <FeatureCard
            title="AI Insights"
            description="Summarize papers, find related work, generate problem statements, and get methodology suggestions."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            }
          />
        </div>

        {/* Source Logos Section */}
        <div className="mt-16 sm:mt-20 max-w-4xl mx-auto w-full text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Integrated Sources</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {['PubMed', 'CORE', 'ScienceDirect', 'ResearchGate', 'arXiv', 'CrossRef', 'Semantic Scholar', 'IEEE', 'Hugging Face', 'World Bank', 'NASA', 'OpenAlex'].map((name) => (
              <span key={name} className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-xs text-gray-500 font-medium shadow-sm">
                {name}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-10 lg:px-20 py-6 sm:py-8 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs sm:text-sm text-gray-400">
            ResearchHub AI &mdash; Built for researchers, by researchers.
          </span>
          <span className="text-xs text-gray-300">
            &copy; {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon, isNew }) {
  return (
    <div className={`bg-white rounded-2xl p-6 sm:p-8 border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
      isNew ? 'border-violet-200 shadow-violet-100/50 hover:shadow-violet-200/70' : 'border-gray-100 shadow-gray-200/50 hover:shadow-gray-200/70'
    }`}>
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border ${
          isNew ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-gray-50 text-gray-700 border-gray-100'
        }`}>
          {icon}
        </div>
        {isNew && <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-[10px] font-bold uppercase rounded-full">New</span>}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
