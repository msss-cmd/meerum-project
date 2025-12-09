import React, { useState } from 'react';
import { AppStatus, AnalysisResult, User } from './types';
import FileUpload from './components/FileUpload';
import ResultsDashboard from './components/ResultsDashboard';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { extractTextFromPDF } from './services/pdfService';
import { extractMetadata, summarizePaper, findSimilarPapers, evaluateSummary } from './services/geminiService';
import { logActivity } from './services/authService';
import { Loader2, BrainCircuit, LogOut, LayoutDashboard, Search } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [adminView, setAdminView] = useState<'analyzer' | 'dashboard'>('analyzer');

  // App Logic State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // If admin logs in, default to dashboard
    if (loggedInUser.role === 'admin') {
      setAdminView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    handleReset();
    setAdminView('analyzer');
  };

  const handleFileSelect = async (file: File) => {
    try {
      setStatus(AppStatus.PARSING_PDF);
      setProgressMessage('Extracting text from PDF...');
      const text = await extractTextFromPDF(file);

      if (!text || text.trim().length === 0) {
        throw new Error("Extracted text is empty. The PDF might be an image scan.");
      }

      setStatus(AppStatus.ANALYZING);
      
      // 1. Extract Metadata
      setProgressMessage('Analyzing structure and metadata...');
      const metadata = await extractMetadata(text);
      
      // 2. Summarize
      setProgressMessage('Generating comprehensive summary...');
      const summary = await summarizePaper(text);
      
      // 3. Find Similar Papers
      setProgressMessage('Searching for related literature...');
      const similarPapers = await findSimilarPapers(metadata.title, metadata.abstract);
      
      // 4. Evaluate
      setProgressMessage('Evaluating summary accuracy against source...');
      const evaluation = await evaluateSummary(text, summary);

      // Log the activity
      if (user) {
        logActivity(user, metadata.title);
      }

      setResult({
        metadata: { ...metadata, text },
        summary,
        similarPapers,
        evaluation
      });
      
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setError(null);
  };

  // ---------------- Render Logic ----------------

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight hidden sm:block">ScholarSync</span>
            </div>

            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
                  <button
                    onClick={() => setAdminView('analyzer')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      adminView === 'analyzer' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Analyzer</span>
                  </button>
                  <button
                    onClick={() => setAdminView('dashboard')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      adminView === 'dashboard' 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* View Switcher: Either Admin Dashboard or The Analyzer App */}
        {user.role === 'admin' && adminView === 'dashboard' ? (
          <AdminDashboard />
        ) : (
          <>
            {status === AppStatus.IDLE && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                    Research Faster.
                  </h1>
                  <p className="text-lg text-slate-600">
                    Upload a paper to generate summaries, evaluate accuracy, and discover related work instantly.
                  </p>
                </div>
                <FileUpload onFileSelect={handleFileSelect} isProcessing={false} />
              </div>
            )}

            {(status === AppStatus.PARSING_PDF || status === AppStatus.ANALYZING) && (
              <div className="max-w-xl mx-auto mt-20 text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-indigo-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{status === AppStatus.PARSING_PDF ? 'Reading PDF' : 'Analyzing Content'}</h3>
                  <p className="text-slate-500 mt-2 animate-pulse">{progressMessage}</p>
                </div>
              </div>
            )}

            {status === AppStatus.ERROR && (
              <div className="max-w-xl mx-auto mt-12 bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button 
                  onClick={handleReset}
                  className="px-6 py-2 bg-white border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {status === AppStatus.COMPLETED && result && (
              <ResultsDashboard result={result} onReset={handleReset} />
            )}
          </>
        )}

      </main>
    </div>
  );
};

export default App;