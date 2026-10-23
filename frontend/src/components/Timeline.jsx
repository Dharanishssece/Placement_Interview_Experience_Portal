import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code2, Users, FileText, BrainCircuit, CheckCircle, HelpCircle } from 'lucide-react';
import Badge from './Badge';

export default function Timeline({ rounds = [] }) {
  const [openRounds, setOpenRounds] = useState({ 0: true });

  const toggleRound = (idx) => {
    setOpenRounds((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getRoundIcon = (type) => {
    switch (type) {
      case 'Coding':
        return <Code2 className="w-5 h-5 text-indigo-600" />;
      case 'Aptitude':
        return <BrainCircuit className="w-5 h-5 text-amber-600" />;
      case 'HR':
        return <Users className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  if (!rounds || rounds.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No interview rounds recorded for this drive.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {rounds.map((round, idx) => {
        const isOpen = !!openRounds[idx];
        const questionCount = round.questions?.length || 0;

        return (
          <div key={idx} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            </div>

            {/* Round Box */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-slate-300 transition-all overflow-hidden">
              <div
                onClick={() => toggleRound(idx)}
                className="p-5 flex items-center justify-between cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {getRoundIcon(round.roundType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-base">{round.roundName}</h4>
                      <Badge status={round.roundType} label={round.roundType} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      {round.duration && <span>⏱ Duration: {round.duration}</span>}
                      <span>•</span>
                      <span>{questionCount} question{questionCount !== 1 ? 's' : ''} recorded</span>
                    </div>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Collapsible Content */}
              {isOpen && (
                <div className="p-5 border-t border-slate-100 space-y-4 bg-white">
                  {round.description && (
                    <p className="text-sm text-slate-600 italic bg-blue-50/50 p-3 rounded-xl border border-blue-100/60">
                      "{round.description}"
                    </p>
                  )}

                  {questionCount > 0 ? (
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Interview Questions & Answers
                      </h5>
                      {round.questions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 flex-1">
                              <HelpCircle className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                              <p className="text-sm font-semibold text-slate-900 leading-snug">
                                {q.questionText}
                              </p>
                            </div>
                            {q.topic && (
                              <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-md shrink-0">
                                {q.topic}
                              </span>
                            )}
                          </div>

                          {q.answerExplanation && (
                            <div className="mt-3 pl-6 text-xs text-slate-600 leading-relaxed border-l-2 border-indigo-400">
                              <span className="font-semibold text-slate-800">Approach & Explanation: </span>
                              {q.answerExplanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No structured questions added for this round.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
