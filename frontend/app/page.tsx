"use client";

import { useState } from "react";

export default function Home() {
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim() || pitch.length < 5) {
      setError("Please enter a startup pitch.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle both direct data or nested data object
        setResult(data.data || data);
      } else {
        setError(data.detail || "Server error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to FastAPI backend on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!pitch.trim() || pitch.length < 5) {
      setError("Please enter a startup pitch first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Startup_Validation_Report.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        setError("Failed to generate PDF report.");
      }
    } catch (err) {
      setError("Connection error while downloading PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/20">
            AI-Powered Market Research Agent
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Autonomous Startup Validator
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Test your business idea instantly with real-time web research, competitor valuations, strategic insights, and PDF reports.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Describe your Startup Idea / Pitch
          </label>
          <textarea
            rows={3}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="e.g., An app for mental health of young age group..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleValidate}
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Agent is analyzing market... ⏳" : "Validate Idea 🚀"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Processing PDF... 📄" : "Download PDF 📄"}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Score & Justification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Feasibility Score</span>
                <span className="text-5xl font-black text-indigo-400 mt-2">
                  {result.validation_score ?? result.score ?? 75}
                  <span className="text-lg text-slate-500">/100</span>
                </span>
              </div>
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-medium mb-1">Score Breakdown</h3>
                <p className="text-slate-300 text-sm">{result.score_justification || result.justification || "Analysis generated successfully based on market metrics."}</p>
              </div>
            </div>

            {/* Pitch Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
              <h3 className="text-indigo-400 font-semibold text-lg flex items-center gap-2">💡 Refined Pitch Summary</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{result.idea_summary || result.summary || pitch}</p>
            </div>

            {/* Market Analysis & Trends */}
            {(result.market_analysis || result.market) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-indigo-400 font-semibold text-lg flex items-center gap-2">📊 Market Analysis & Trends</h3>
                <p className="text-slate-300 text-sm">
                  {result.market_analysis?.tam_sam_som_overview || result.market?.overview || "Market sizing and addressable segments evaluated."}
                </p>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2">Key Industry Trends</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                    {(result.market_analysis?.industry_trends || result.market?.trends || ["Growing digital adoption", "Increased demand for personalized services"]).map((trend: string, idx: number) => (
                      <li key={idx}>{trend}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Competitors with Valuations & Insights */}
            {(result.competitors || result.competitor_list) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-indigo-400 font-semibold text-lg flex items-center gap-2">
                  🥊 Competitor Intelligence & Valuations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(result.competitors || result.competitor_list).map((comp: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-100 text-base">{comp.name || comp.competitor_name}</h4>
                          <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                            {comp.market_position || comp.position || "Competitor"}
                          </span>
                        </div>
                        
                        <p className="text-emerald-400 text-xs font-semibold">
                          💰 Valuation / Funding: <span className="text-slate-300 font-normal">{comp.valuation_or_funding || comp.valuation || "N/A"}</span>
                        </p>

                        <p className="text-slate-400 text-xs leading-relaxed">{comp.description || comp.overview}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
                        <div>
                          <span className="text-emerald-400 font-semibold">Strengths: </span>
                          <span className="text-slate-300">{Array.isArray(comp.strengths) ? comp.strengths.join(", ") : comp.strengths || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-rose-400 font-semibold">Weaknesses: </span>
                          <span className="text-slate-300">{Array.isArray(comp.weaknesses) ? comp.weaknesses.join(", ") : comp.weaknesses || "N/A"}</span>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-indigo-300">
                          <span className="font-bold text-indigo-400">💡 Strategic Insight: </span>
                          {comp.strategic_insight || comp.insight || "Focus on niche differentiation and user retention."}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended MVP Features */}
            {(result.recommended_mvp_features || result.mvp_features) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-indigo-400 font-semibold text-lg flex items-center gap-2">🛠️ Recommended MVP Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(result.recommended_mvp_features || result.mvp_features).map((feature: string, idx: number) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 flex items-center gap-2">
                      <span className="text-indigo-400 font-bold">✓</span> {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}

