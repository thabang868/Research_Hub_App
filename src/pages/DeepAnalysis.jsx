import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function DeepAnalysis() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('single');

  // PDF upload state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Cross-analysis state
  const [crossPdfFiles, setCrossPdfFiles] = useState([]);
  const [crossPdfData, setCrossPdfData] = useState(null);
  const [crossUploading, setCrossUploading] = useState(false);
  const crossFileInputRef = useRef(null);

  // Results
  const [result, setResult] = useState(null);
  const [crossResult, setCrossResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Upload single PDF
  const uploadPdf = async (file) => {
    if (!file) return;
    setUploading(true);
    setPdfData(null);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await fetch('/api/deep/upload-pdf', { method: 'POST', body: formData });
      const data = await res.json();
      setPdfData(data);
    } catch {
      setPdfData({ error: 'Failed to process PDF' });
    } finally {
      setUploading(false);
    }
  };

  // Upload multiple PDFs
  const uploadCrossPdfs = async (files) => {
    if (files.length < 2) return;
    setCrossUploading(true);
    setCrossPdfData(null);
    const formData = new FormData();
    for (const f of files) formData.append('pdfs', f);

    try {
      const res = await fetch('/api/deep/upload-pdfs', { method: 'POST', body: formData });
      const data = await res.json();
      setCrossPdfData(data);
    } catch {
      setCrossPdfData({ error: 'Failed to process PDFs' });
    } finally {
      setCrossUploading(false);
    }
  };

  // Analyze single paper (from manual or PDF)
  const analyzeSingle = async () => {
    const paperTitle = pdfData?.title;
    const paperAbstract = pdfData?.fullText || pdfData?.abstract || '';
    const paperAuthors = [];

    if (!paperTitle) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/deep/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: paperTitle, abstract: paperAbstract, authors: paperAuthors, userId: user?.id }),
      });
      setResult(await res.json());
    } catch {
      setResult({ analysis: 'Failed to analyze. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Cross-analyze from PDFs
  const analyzeCross = async () => {
    if (!crossPdfData?.papers || crossPdfData.papers.length < 2) return;
    const papersToAnalyze = crossPdfData.papers;

    setLoading(true);
    setCrossResult(null);
    try {
      const res = await fetch('/api/deep/cross-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papers: papersToAnalyze }),
      });
      setCrossResult(await res.json());
    } catch {
      setCrossResult({ synthesis: 'Failed to analyze. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const canAnalyzeSingle = !!pdfData?.title;
  const canAnalyzeCross = crossPdfData?.papers?.length >= 2;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar current="Deep Analysis" />

      <main className="px-6 sm:px-10 lg:px-20 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Deep Research Analysis</h1>
                <p className="text-sm text-gray-500">AI-powered paper analysis with knowledge graph connections</p>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => { setMode('single'); setResult(null); }}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${mode === 'single' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              Single Paper Analysis
            </button>
            <button onClick={() => { setMode('cross'); setCrossResult(null); }}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${mode === 'cross' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              Cross-Paper Connections
            </button>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 mb-8 overflow-hidden">

            {/* Hidden file inputs — always mounted, visually hidden but not display:none */}
            <input id="single-pdf-input" ref={fileInputRef} type="file" accept="application/pdf,.pdf"
              style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPdfFile(f); uploadPdf(f); } e.target.value = ''; }} />
            <input id="cross-pdf-input" ref={crossFileInputRef} type="file" accept="application/pdf,.pdf" multiple
              style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }}
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 10);
                if (files.length >= 2) { setCrossPdfFiles(files); uploadCrossPdfs(files); }
                else if (files.length > 0) alert('Please select at least 2 PDF files.');
                e.target.value = '';
              }} />

            <div className="p-8">
              {/* ── SINGLE PAPER ── */}
              {mode === 'single' && (
                <>
                  <div>
                    {!pdfData && !uploading && (
                      <label htmlFor="single-pdf-input"
                        className="block border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-600 mb-1">Click to upload a PDF</p>
                        <p className="text-xs text-gray-400">Max 20MB. The AI will extract and analyze the content.</p>
                      </label>
                    )}

                    {uploading && (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-gray-500">Extracting text from PDF...</p>
                      </div>
                    )}

                    {pdfData && !pdfData.error && (
                      <div>
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-5">
                          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-emerald-800 truncate">{pdfData.fileName}</p>
                            <p className="text-xs text-emerald-600">{pdfData.pages} pages extracted {pdfData.method === 'ocr' || pdfData.method === 'ai-reconstructed' ? '(OCR)' : ''}</p>
                          </div>
                          <button onClick={() => { setPdfFile(null); setPdfData(null); setResult(null); }}
                            className="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer">Change</button>
                        </div>
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-1">Detected title:</p>
                          <p className="text-sm font-semibold text-gray-900">{pdfData.title}</p>
                        </div>
                        {pdfData.abstract && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-1">Detected abstract:</p>
                            <p className="text-sm text-gray-600 line-clamp-4">{pdfData.abstract}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {pdfData?.error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        {pdfData.error}. <button onClick={() => { setPdfFile(null); setPdfData(null); }} className="underline cursor-pointer">Try again</button>
                      </div>
                    )}
                  </div>

                  <button onClick={analyzeSingle} disabled={loading || !canAnalyzeSingle}
                    className="w-full mt-6 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-lg shadow-gray-900/25 hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Analyzing with AI...
                      </span>
                    ) : 'Analyze Paper'}
                  </button>
                </>
              )}

              {/* ── CROSS-PAPER ── */}
              {mode === 'cross' && (
                <>
                  <div>
                    {!crossPdfData && !crossUploading && (
                      <label htmlFor="cross-pdf-input"
                        className="block border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-600 mb-1">Click to upload 2-10 PDFs</p>
                        <p className="text-xs text-gray-400">Select multiple PDF files to discover hidden connections between them.</p>
                      </label>
                    )}

                    {crossUploading && (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-gray-500">Extracting text from {crossPdfFiles.length} PDFs...</p>
                      </div>
                    )}

                    {crossPdfData?.papers && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            <p className="text-sm font-medium text-emerald-800">{crossPdfData.papers.length} papers extracted</p>
                          </div>
                          <button onClick={() => { setCrossPdfFiles([]); setCrossPdfData(null); setCrossResult(null); }}
                            className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Change files</button>
                        </div>
                        <div className="space-y-2">
                          {crossPdfData.papers.map((p, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-400 shrink-0">#{i + 1}</span>
                                <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                                <span className="text-xs text-gray-400 shrink-0">{p.pages}p</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={analyzeCross} disabled={loading || !canAnalyzeCross}
                    className="w-full mt-6 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-lg shadow-gray-900/25 hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Finding connections...
                      </span>
                    ) : 'Discover Hidden Connections'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── RESULTS ── */}
          {mode === 'single' && result && (
            <div className="space-y-6">
              {result.analysis && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50">
                  <div className="flex items-center gap-2 mb-5">
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900">AI Deep Analysis</h2>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <FormattedText text={result.analysis} />
                  </div>
                </div>
              )}
              {result.keywords?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-200/50">
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Extracted Key Concepts</h2>
                  <p className="text-xs text-gray-400 mb-3">Saved to your Neo4j knowledge graph</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.connections?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-200/50">
                  <h2 className="text-base font-semibold text-gray-900 mb-4">Connected Papers in Your Graph</h2>
                  <div className="space-y-3">
                    {result.connections.map((c, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{c.title}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {c.sharedKeywords.map((kw, j) => (
                            <span key={j} className="px-2 py-0.5 bg-white text-gray-500 text-xs rounded-full border border-gray-200">{kw}</span>
                          ))}
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full border border-emerald-200">{c.relevance} shared</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.graph?.saved && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-emerald-700">Paper and connections saved to your knowledge graph</span>
                </div>
              )}
            </div>
          )}

          {mode === 'cross' && crossResult?.synthesis && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Cross-Paper Analysis</h2>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                <FormattedText text={crossResult.synthesis} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FormattedText({ text }) {
  const cleaned = text.replace(/^#{1,6}\s+/gm, '');
  const lines = cleaned.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (/^\*\*[^*]+\*\*[:\s\u2014\u2013-]*$/.test(trimmed))
          return <p key={i} className="font-semibold text-gray-900 mt-4 mb-1 text-[13px]">{trimmed.replace(/\*\*/g, '').replace(/[:\s\u2014\u2013-]+$/, '')}</p>;
        if (trimmed.includes('**')) {
          const parts = trimmed.split(/\*\*(.*?)\*\*/g);
          return <p key={i} className="mb-0.5 text-[13px] leading-relaxed">{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-gray-900">{part}</strong> : <span key={j}>{part}</span>)}</p>;
        }
        if (/^[-\u2022]\s/.test(trimmed))
          return <div key={i} className="flex gap-2 ml-2 mb-0.5"><span className="text-gray-400 shrink-0">&#8226;</span><p className="text-[13px] leading-relaxed">{trimmed.slice(2)}</p></div>;
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\./)[1];
          return <div key={i} className="flex gap-2 ml-2 mb-0.5"><span className="text-gray-400 font-medium text-xs mt-0.5 shrink-0 w-4 text-right">{num}.</span><p className="text-[13px] leading-relaxed">{renderBold(trimmed.replace(/^\d+\.\s*/, ''))}</p></div>;
        }
        return <p key={i} className="text-[13px] leading-relaxed mb-0.5">{trimmed}</p>;
      })}
    </div>
  );
}

function renderBold(text) {
  if (!text.includes('**')) return text;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-gray-900">{part}</strong> : <span key={j}>{part}</span>);
}
