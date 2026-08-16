import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const modeConfig = {
    problem: {
      label: 'Problem Statement',
      placeholder: 'Enter your research topic or question...',
      wrapper: (q) => `Generate a detailed, formal academic problem statement for this research topic: "${q}"

Provide a complete, well-structured problem statement with ALL of the following sections:

**Background** — 3-4 sentences providing context about the broader area, why it matters, and what has been done so far.

**Problem** — 3-4 sentences clearly identifying the specific gap, challenge, or issue. Be precise about what is unknown, unresolved, or inadequate in current research.

**Significance** — 3-4 sentences explaining why solving this problem matters — practical impact, theoretical contribution, societal benefit, and who benefits.

**Research Objective** — 2-3 sentences stating what this research aims to achieve and the expected outcome.

**Research Questions** — 4-5 specific, measurable research questions that guide the study.

**Hypotheses** — 2-3 testable hypotheses related to the research questions.

**Proposed Approach** — 3-4 sentences describing the methodology, tools, data sources, and analytical techniques that could be used.

**Expected Contributions** — 2-3 sentences on what new knowledge this research will add to the field.

Make it formal, specific, and suitable for a thesis proposal or research grant application.`,
    },
    summarize: {
      label: 'Summarize Topic',
      placeholder: 'Enter the research topic you want summarized...',
      wrapper: (q) => `Summarize this research topic in full detail: "${q}"

Provide a comprehensive, well-organized summary with ALL of the following sections:

**Overview** — A clear overview of the topic in 4-5 sentences.

**Key Findings** — List all major findings and results (at least 4-5 points). Be specific with numbers, percentages, and outcomes where possible.

**Methodology** — Detailed description of the research methods used: study design, data collection, sample size, tools, frameworks, and analytical techniques.

**Main Contributions** — What does this paper add to the field? Why is it significant? How does it advance existing knowledge?

**Theoretical Framework** — What theories or models does the paper build upon or challenge?

**Limitations** — What are the gaps, weaknesses, or constraints of the study? (at least 3 points)

**Future Research Directions** — What do the authors suggest for future work? What questions remain unanswered?

**Practical Implications** — How can this research be applied in practice? Who benefits?

**Suggested Keywords** — 8-10 relevant keywords for this research.

**Related Research Areas** — 5 closely related topics or fields worth exploring.`,
    },
    suggest: {
      label: 'Suggest Topics',
      placeholder: 'Enter your research area or field of interest...',
      wrapper: (q) => `Based on this research interest: "${q}"

Provide a comprehensive, detailed list of research suggestions with ALL of the following:

**10 Trending Research Topics** — For each topic provide:
- The specific topic title
- Why it is trending now (2-3 sentences)
- 2-3 potential research questions
- Recommended methodology

**Recommended Datasets** — For each topic, suggest 2-3 specific datasets with:
- Exact dataset name
- Source (Kaggle, UCI, Harvard Dataverse, Zenodo, World Bank, etc.)
- URL or where to find it
- What it contains and size

**Methodologies & Tools** — For each topic suggest:
- Research methodology (quantitative, qualitative, mixed)
- Specific tools and frameworks (e.g., Python scikit-learn, R, SPSS, NVivo)
- Statistical techniques to use

**Evaluation Metrics** — Specific metrics and benchmarks to measure success in each topic.

**Research Gap Opportunities** — 5 specific gaps in the literature where new contributions can be made, with justification for why each gap exists.`,
    },
    methodology: {
      label: 'Compare Methods',
      placeholder: 'Enter the research topic or methodologies you want to compare...',
      wrapper: (q) => `Compare and analyze research methodologies for this topic: "${q}"

Provide a thorough, detailed comparison with ALL of the following:

**Available Methodologies** — List all relevant research methodologies for this topic (at least 5). For each one provide:
- Name and description
- When to use it (ideal scenarios)
- Advantages (at least 3)
- Disadvantages (at least 3)
- Example studies that used it

**Quantitative vs Qualitative vs Mixed Methods** — Detailed comparison for this specific topic:
- Which approach is best suited and why
- Data collection methods for each
- Analysis techniques for each
- Sample size requirements

**Tools & Frameworks** — Specific tools for each methodology:
- Software (SPSS, R, Python, NVivo, Atlas.ti, etc.)
- Libraries and packages
- Data collection tools (surveys, interviews, sensors, etc.)

**Research Process Flow** — A step-by-step text flow diagram for the recommended methodology:
Start → Step 1 → Step 2 → ... → End

**Evaluation Metrics & Matrices** — Specific metrics to measure research quality and results for this topic.

**Recommendation** — Clear recommendation on which methodology to use based on the topic, with justification.`,
    },
    gaps: {
      label: 'Find Gaps',
      placeholder: 'Enter the research field or topic to find gaps in...',
      wrapper: (q) => `Identify research gaps and opportunities in: "${q}"

Provide a comprehensive, detailed gap analysis with ALL of the following:

**Current State of Research** — What has been done so far in this field? Summarize the key developments and milestones (5-6 sentences).

**10 Identified Research Gaps** — For each gap provide:
- Clear description of the gap (what is missing or unknown)
- Why this gap exists (lack of data, methodology limitations, unexplored area, etc.)
- Evidence that this gap is real (cite relevant context)
- Potential impact of filling this gap
- Suggested research approach to address it

**Underexplored Areas** — 5 specific sub-topics or angles within this field that have received insufficient attention.

**Methodological Gaps** — What methods have NOT been applied to this field that could yield new insights?

**Data Gaps** — What types of data are missing? What datasets need to be created?

**Interdisciplinary Opportunities** — How could combining this field with other disciplines create new research directions?

**Novel Research Ideas** — 5 specific, original research project ideas with:
- Title
- Research question
- Proposed methodology
- Expected contribution
- Feasibility assessment (high/medium/low)

**Priority Ranking** — Rank the top 5 most impactful gaps to address first, with justification.`,
    },
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');

    // Build the actual message — wrap with mode context if active
    let aiMessage = userMsg;
    let displayMsg = userMsg;
    if (activeMode && modeConfig[activeMode]) {
      aiMessage = modeConfig[activeMode].wrapper(userMsg);
      displayMsg = `[${modeConfig[activeMode].label}] ${userMsg}`;
    }

    setMessages((m) => [...m, { role: 'user', content: displayMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiMessage }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'Sorry, I could not generate a response.' }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const generateDiagram = async (query) => {
    setDiagramLoading(true);
    setMessages((m) => [...m, { role: 'user', content: `Generate a methodology flow diagram for: ${query}` }]);

    try {
      const res = await fetch('/api/ai/methodology-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (data.drawioUrl) {
        setMessages((m) => [...m, {
          role: 'assistant',
          content: `Your methodology flow diagram has been generated.\n\nClick the button below to open it in Draw.io where you can edit, customize, and export it.`,
          diagram: { url: data.drawioUrl, xml: data.xml },
        }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: 'Could not generate diagram. Try describing your methodology in more detail.' }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Failed to generate diagram.' }]);
    } finally {
      setDiagramLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar current="AI Assistant" />

      <main className="flex-1 flex flex-col px-6 sm:px-10 lg:px-20 py-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Research Assistant</h1>
        </div>

        {/* Mode Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(modeConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                setActiveMode(activeMode === key ? null : key);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className={`px-4 py-2 border rounded-lg text-sm transition-all cursor-pointer ${
                activeMode === key
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
        {activeMode && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-100 rounded-lg">
            <span className="text-xs font-medium text-gray-500">Mode:</span>
            <span className="text-xs font-semibold text-gray-900">{modeConfig[activeMode].label}</span>
            <span className="text-xs text-gray-400">— type your topic below and the AI will respond accordingly</span>
            <button onClick={() => setActiveMode(null)} className="ml-auto text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Clear</button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 min-h-0">
          {messages.length === 0 && !loading && (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gray-200">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">Select a mode above, then type your research topic or question.</p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                msg.role === 'user'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                  : 'bg-white border border-gray-100 shadow-lg shadow-gray-200/50 text-gray-700'
              }`}>
                <div className="text-sm leading-relaxed">
                  {msg.role === 'assistant' ? <FormattedText text={msg.content} /> : msg.content}
                </div>
                {/* Diagram button */}
                {msg.diagram && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href={msg.diagram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-md hover:bg-gray-800 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      Open in Draw.io
                    </a>
                    <button
                      onClick={() => {
                        const blob = new Blob([msg.diagram.xml], { type: 'application/xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'methodology-diagram.drawio';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 ml-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download .drawio
                    </button>
                  </div>
                )}
                {/* Generate diagram button for methodology responses */}
                {msg.role === 'assistant' && !msg.diagram && i > 0 && messages[i - 1]?.role === 'user' &&
                  (messages[i - 1].content.toLowerCase().includes('method') ||
                   messages[i - 1].content.toLowerCase().includes('flow') ||
                   messages[i - 1].content.toLowerCase().includes('process') ||
                   messages[i - 1].content.toLowerCase().includes('approach')) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => generateDiagram(messages[i - 1].content)}
                      disabled={diagramLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-md hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {diagramLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Generating Diagram...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                          </svg>
                          Generate Flow Diagram (Draw.io)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 shadow-lg shadow-gray-200/50 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-3 sticky bottom-0 bg-gray-50 pt-2 pb-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeMode ? modeConfig[activeMode].placeholder : 'Ask about your research, paste an abstract, or describe your topic...'}
            className="flex-1 px-5 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-lg shadow-gray-900/25 hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

// Rich text formatter — handles bold, lists, references, flow arrows
function FormattedText({ text }) {
  // Strip any remaining # headings
  const cleaned = text.replace(/^#{1,6}\s+/gm, '');
  const lines = cleaned.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Empty lines = spacing
        if (!trimmed) {
          return <div key={i} className="h-2" />;
        }

        // Reference section header
        if (/^\*?\*?references\*?\*?$/i.test(trimmed.replace(/[:\s]/g, ''))) {
          return (
            <div key={i} className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">References</p>
            </div>
          );
        }

        // Flow diagram arrows (→)
        if (trimmed.includes('→')) {
          return (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 my-2 font-mono text-xs text-gray-700 overflow-x-auto">
              {trimmed}
            </div>
          );
        }

        // Bold-only lines (**Title**)
        if (/^\*\*[^*]+\*\*[:\s—–-]*$/.test(trimmed)) {
          return (
            <p key={i} className="font-semibold text-gray-900 mt-3 mb-1 text-[13px]">
              {trimmed.replace(/\*\*/g, '').replace(/[:\s—–-]+$/, '')}
            </p>
          );
        }

        // Lines with inline bold
        if (trimmed.includes('**')) {
          const parts = trimmed.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={i} className="mb-0.5 text-[13px] leading-relaxed">
              {parts.map((part, j) =>
                j % 2 === 1
                  ? <strong key={j} className="font-semibold text-gray-900">{part}</strong>
                  : <span key={j}>{part}</span>
              )}
            </p>
          );
        }

        // Bullet points
        if (/^[-•]\s/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2 ml-2 mb-0.5">
              <span className="text-gray-400 mt-0.5 shrink-0">&#8226;</span>
              <p className="text-[13px] leading-relaxed">{trimmed.slice(2)}</p>
            </div>
          );
        }

        // Numbered lists
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\./)[1];
          const content = trimmed.replace(/^\d+\.\s*/, '');
          return (
            <div key={i} className="flex gap-2 ml-2 mb-0.5">
              <span className="text-gray-400 font-medium text-xs mt-0.5 shrink-0 w-4 text-right">{num}.</span>
              <p className="text-[13px] leading-relaxed">{renderInlineBold(content)}</p>
            </div>
          );
        }

        // Regular paragraph
        return <p key={i} className="text-[13px] leading-relaxed mb-0.5">{trimmed}</p>;
      })}
    </div>
  );
}

function renderInlineBold(text) {
  if (!text.includes('**')) return text;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) =>
    j % 2 === 1
      ? <strong key={j} className="font-semibold text-gray-900">{part}</strong>
      : <span key={j}>{part}</span>
  );
}
