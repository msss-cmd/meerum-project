import React from 'react';
import { AnalysisResult } from '../types';
import ScoreChart from './ScoreChart';
import { ExternalLink, BookOpen, CheckCircle, AlertCircle, FileText, Layers } from 'lucide-react';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onReset }) => {
  const { metadata, summary, similarPapers, evaluation } = result;

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{metadata.title}</h1>
          <p className="text-slate-600 text-sm line-clamp-2 max-w-3xl">{metadata.abstract}</p>
        </div>
        <button 
          onClick={onReset}
          className="shrink-0 ml-4 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Analyze Another
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Summary & Analysis */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">AI Summary</h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-justify mb-6">
              {summary.mainSummary}
            </p>

            {/* Structured Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Key Contributions</h3>
                <ul className="space-y-2">
                  {summary.contributions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Methodology</h3>
                   <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                     {summary.method.map((m, i) => <li key={i}>{m}</li>)}
                   </ul>
                </div>
                 <div>
                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Results</h3>
                   <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                     {summary.results.map((r, i) => <li key={i}>{r}</li>)}
                   </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Details */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">Summary Evaluation</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center justify-around mb-6">
               <ScoreChart score={evaluation.score} label="Overall Faithfulness" color="#4f46e5" />
               <ScoreChart score={evaluation.semanticSimilarityScore} label="Semantic Match" color="#0ea5e9" />
               <ScoreChart score={evaluation.keypointCoverageScore} label="Keypoint Coverage" color="#8b5cf6" />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
              <h4 className="font-semibold text-slate-800 text-sm mb-1">Judge's Reasoning</h4>
              <p className="text-slate-600 text-sm italic">"{evaluation.reasoning}"</p>
            </div>

            {evaluation.missingKeypoints && evaluation.missingKeypoints.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-amber-700 text-sm mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Missed Concepts
                </h4>
                <ul className="list-disc list-inside text-sm text-slate-600">
                  {evaluation.missingKeypoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Similar Papers */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">Similar Research</h2>
            </div>
            
            <div className="space-y-4">
              {similarPapers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No similar papers found via search.</p>
                </div>
              ) : (
                similarPapers.map((paper, idx) => (
                  <div key={idx} className="group p-4 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                    <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
                      <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 flex items-start gap-1">
                        {paper.title}
                      </a>
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded">
                        {paper.source || 'Web'}
                      </span>
                      <a 
                        href={paper.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 text-xs font-medium flex items-center gap-1 hover:underline"
                      >
                        Read Paper <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg">
              <strong>Note:</strong> Results are retrieved using AI-powered search grounding.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;