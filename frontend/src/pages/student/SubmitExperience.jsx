import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Plus,
  Trash2,
  FileText,
  HelpCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Badge from '../../components/Badge';

export default function SubmitExperience() {
  const [eligibilityData, setEligibilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedPlacementId, setSelectedPlacementId] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [selectionYear, setSelectionYear] = useState('2025');
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  const [overallExperience, setOverallExperience] = useState('');
  const [preparationStrategy, setPreparationStrategy] = useState('');
  const [tips, setTips] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  // Interview Rounds Builder State
  const [rounds, setRounds] = useState([
    {
      roundNumber: 1,
      roundName: 'Round 1: Online Assessment / Coding',
      roundType: 'Coding',
      duration: '60 mins',
      description: 'Online technical challenge',
      questions: [
        {
          questionText: '',
          answerExplanation: '',
          topic: 'DSA',
          difficulty: 'Medium',
        },
      ],
    },
  ]);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/eligibility');
        if (res.data.success) {
          setEligibilityData(res.data);
          const eligible = res.data.eligibleCompanies || [];
          if (eligible.length > 0) {
            setSelectedPlacementId(eligible[0].recordId);
            setJobRole(eligible[0].jobRole || '');
          }
        }
      } catch (err) {
        console.error('Failed to check eligibility:', err);
        toast.error('Failed to verify placement eligibility.');
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, []);

  // Update selected role when placement dropdown changes
  const handlePlacementChange = (recId) => {
    setSelectedPlacementId(recId);
    const rec = eligibilityData?.eligibleCompanies?.find((e) => e.recordId === recId);
    if (rec) {
      setJobRole(rec.jobRole || '');
    }
  };

  // Add Round
  const addRound = () => {
    const nextNum = rounds.length + 1;
    setRounds([
      ...rounds,
      {
        roundNumber: nextNum,
        roundName: `Round ${nextNum}: Technical Interview`,
        roundType: 'Technical',
        duration: '45 mins',
        description: '',
        questions: [
          {
            questionText: '',
            answerExplanation: '',
            topic: 'Core CS / Algorithms',
            difficulty: 'Medium',
          },
        ],
      },
    ]);
  };

  const removeRound = (index) => {
    if (rounds.length <= 1) {
      toast.warning('At least one interview round is required.');
      return;
    }
    setRounds(rounds.filter((_, i) => i !== index));
  };

  // Add Question to specific round
  const addQuestion = (roundIndex) => {
    const updated = [...rounds];
    updated[roundIndex].questions.push({
      questionText: '',
      answerExplanation: '',
      topic: 'General',
      difficulty: 'Medium',
    });
    setRounds(updated);
  };

  const removeQuestion = (roundIndex, questionIndex) => {
    const updated = [...rounds];
    if (updated[roundIndex].questions.length <= 1) {
      toast.warning('Each round must contain at least one question.');
      return;
    }
    updated[roundIndex].questions = updated[roundIndex].questions.filter((_, i) => i !== questionIndex);
    setRounds(updated);
  };

  const handleQuestionChange = (roundIndex, questionIndex, field, value) => {
    const updated = [...rounds];
    updated[roundIndex].questions[questionIndex][field] = value;
    setRounds(updated);
  };

  const handleRoundChange = (roundIndex, field, value) => {
    const updated = [...rounds];
    updated[roundIndex][field] = value;
    setRounds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlacementId) {
      toast.error('Please select an eligible verified placement.');
      return;
    }

    const selectedRec = eligibilityData?.eligibleCompanies?.find(
      (e) => e.recordId === selectedPlacementId
    );

    if (!selectedRec) {
      toast.error('Selected placement record is invalid.');
      return;
    }

    if (selectedRec.alreadySubmitted) {
      toast.error('You have already submitted an experience for this drive. Please view My Submissions to edit.');
      return;
    }

    // Validate that questions are filled
    for (let r of rounds) {
      for (let q of r.questions) {
        if (!q.questionText.trim()) {
          toast.error(`Please enter question text in "${r.roundName}".`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('companyId', selectedRec.company?._id);
      formData.append('driveId', selectedRec.drive?._id);
      formData.append('jobRole', jobRole.trim());
      formData.append('selectionYear', selectionYear);
      formData.append('difficultyLevel', difficultyLevel);
      formData.append('overallExperience', overallExperience.trim());
      formData.append('preparationStrategy', preparationStrategy.trim());
      formData.append('tips', tips.trim());
      formData.append('rounds', JSON.stringify(rounds));

      if (pdfFile) {
        if (pdfFile.type !== 'application/pdf') {
          toast.error('Supporting document must be a valid PDF file.');
          setSubmitting(false);
          return;
        }
        formData.append('pdfFile', pdfFile);
      }

      const res = await api.post('/student/experiences', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Interview experience submitted successfully! It is now pending officer review.');
        navigate('/student/my-submissions');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit experience.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Verifying placement eligibility...</div>;
  }

  // If student has no verified placements:
  if (!eligibilityData?.hasEligiblePlacements) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Placement Verification Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            To maintain peer authenticity and academic integrity, only students whose campus placement selection has been officially verified by the <strong>Placement Officer</strong> can publish interview experiences.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-left">
            <p className="font-bold text-slate-800 mb-1">What to do next:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>If you recently received an offer letter, submit it to the college Placement Cell.</li>
              <li>Once verified by the Placement Officer, this submission portal will unlock automatically.</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const eligiblePlacements = eligibilityData.eligibleCompanies || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Submit Interview Experience</h1>
        <p className="text-xs text-slate-500 mt-1">
          Share your recruitment rounds, interview questions, and prep tips for verified institutional review
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* Step 1: Verified Placement Selection */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1. Select Verified Placement
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Verified Placement Drive *
              </label>
              <select
                required
                value={selectedPlacementId}
                onChange={(e) => handlePlacementChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {eligiblePlacements.map((p) => (
                  <option key={p.recordId} value={p.recordId} disabled={p.alreadySubmitted}>
                    {p.company?.name} ({p.drive?.academicYear}) - {p.packageDisplay || `${p.packageCTC} LPA`}{' '}
                    {p.alreadySubmitted ? '(Already Submitted)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Role Title *</label>
              <input
                type="text"
                required
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Selection Year *</label>
              <input
                type="text"
                required
                value={selectionYear}
                onChange={(e) => setSelectionYear(e.target.value)}
                placeholder="2025"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Overall Interview Difficulty *</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-bold"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Very Hard">Very Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Round-wise Interview Questions Builder */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" /> 2. Interview Rounds & Questions
              </h2>
              <p className="text-slate-400 mt-0.5">
                Record each round, duration, and the specific interview questions asked
              </p>
            </div>

            <button
              type="button"
              onClick={addRound}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Next Round
            </button>
          </div>

          <div className="space-y-6">
            {rounds.map((round, rIdx) => (
              <div
                key={rIdx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-extrabold text-slate-900 text-sm">
                    Round {rIdx + 1} Configuration
                  </span>
                  {rounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRound(rIdx)}
                      className="text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Round
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Round Title</label>
                    <input
                      type="text"
                      required
                      value={round.roundName}
                      onChange={(e) => handleRoundChange(rIdx, 'roundName', e.target.value)}
                      placeholder="e.g. Round 1: Online Coding"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Round Type</label>
                    <select
                      value={round.roundType}
                      onChange={(e) => handleRoundChange(rIdx, 'roundType', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="Coding">Coding</option>
                      <option value="Technical">Technical</option>
                      <option value="Aptitude">Aptitude</option>
                      <option value="HR">HR & Behavioral</option>
                      <option value="Managerial">Managerial</option>
                      <option value="System Design">System Design</option>
                      <option value="Group Discussion">Group Discussion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={round.duration}
                      onChange={(e) => handleRoundChange(rIdx, 'duration', e.target.value)}
                      placeholder="e.g. 60 mins"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                {/* Questions in this round */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                      Questions Asked in Round {rIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => addQuestion(rIdx)}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Question
                    </button>
                  </div>

                  {round.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <label className="block font-semibold text-slate-700 mb-1">
                            Question {qIdx + 1} *
                          </label>
                          <textarea
                            required
                            rows={2}
                            value={q.questionText}
                            onChange={(e) =>
                              handleQuestionChange(rIdx, qIdx, 'questionText', e.target.value)
                            }
                            placeholder="e.g. Implement LRU Cache or Explain ACID properties in DBMS..."
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                          />
                        </div>

                        {round.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(rIdx, qIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 mt-5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Topic / Category
                          </label>
                          <input
                            type="text"
                            value={q.topic}
                            onChange={(e) =>
                              handleQuestionChange(rIdx, qIdx, 'topic', e.target.value)
                            }
                            placeholder="e.g. DP / Trees / SQL"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Suggested Approach / Explanation
                          </label>
                          <input
                            type="text"
                            value={q.answerExplanation}
                            onChange={(e) =>
                              handleQuestionChange(rIdx, qIdx, 'answerExplanation', e.target.value)
                            }
                            placeholder="e.g. Solved with hash map and doubly linked list in O(1)"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Overall Narrative, Prep Strategy, Tips & PDF Upload */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" /> 3. Overall Experience Narrative & Tips
          </h2>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Overall Recruitment Experience Description *
            </label>
            <textarea
              required
              rows={4}
              value={overallExperience}
              onChange={(e) => setOverallExperience(e.target.value)}
              placeholder="Describe the interview environment, interviewer friendliness, behavioral questions, and process timeline..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Preparation Strategy & Recommended Resources *
            </label>
            <textarea
              required
              rows={3}
              value={preparationStrategy}
              onChange={(e) => setPreparationStrategy(e.target.value)}
              placeholder="How many DSA problems did you solve? Which books, channels, or platforms did you use?..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tips for Future Candidates</label>
            <input
              type="text"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="e.g. Focus on edge cases, speak out your thoughts, and practice writing clean code on Google Docs."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          {/* Optional PDF Attachment */}
          <div className="pt-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Optional Supporting PDF Document (Max 10MB)
            </label>
            <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0] || null)}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-[11px] text-slate-400 mt-2">
                Optional: Upload notes, algorithm diagrams, or interview cheat-sheets in PDF format.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Submitting for Officer Review...' : 'Submit Interview Experience'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
