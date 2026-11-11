"use client";

import { useState } from "react";

export default function Home() {
  const [pitch, setPitch] = useState("");
  const [location, setLocation] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null); // ✅ State yahan properly linked hai
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
    setPdfBase64(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          pitch, 
          location: location.trim() || "Global" 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.data || data);
        setPdfBase64(data.pdf_base64); // ✅ Agent ke sath hi PDF base64 save ho gaya
      } else {
        setError(data.detail || "Server error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to FastAPI backend on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfBase64) {
      setError("Please validate your idea first before downloading.");
      return;
    }

    try {
      // ✅ Bina dobara agent run kiye, browser mein hi instant download
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Startup_Validation_Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to generate PDF download.");
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
          
          <div className="space-y-2">
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
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Target Location / Region (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., India, US, Bangalore, Global..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleValidate}
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Agent is analyzing market... ⏳" : "Validate Idea 🚀"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={loading || !pdfBase64}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              Download PDF 📄
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Feasibility Score</span>
                <span className="text-5xl font-black text-indigo-400 mt-2">
                  {result.validation_score ?? 75}
                  <span className="text-lg text-slate-500">/100</span>
                </span>
              </div>
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-medium mb-1">Score Breakdown</h3>
                <p className="text-slate-300 text-sm">{result.score_justification}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
              <h3 className="text-indigo-400 font-semibold text-lg flex items-center gap-2">💡 Refined Pitch Summary</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{result.idea_summary}</p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}