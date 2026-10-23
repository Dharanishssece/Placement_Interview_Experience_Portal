import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import { Bookmark, ArrowRight, Trash2, Compass } from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/bookmarks');
      if (res.data.success) {
        setBookmarks(res.data.bookmarks || []);
      }
    } catch (err) {
      toast.error('Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (expId) => {
    try {
      const res = await api.post(`/student/bookmarks/${expId}`);
      if (res.data.success) {
        toast.success('Experience removed from bookmarks.');
        setBookmarks((prev) => prev.filter((b) => b._id !== expId));
      }
    } catch (err) {
      toast.error('Failed to remove bookmark.');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading your saved bookmarks...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Bookmarks</h1>
        <p className="text-xs text-slate-500 mt-1">
          Quickly revisit key interview rounds, technical questions, and company prep notes
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Bookmarks Saved Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Browse verified interview experiences and click the bookmark icon to save key questions here.
          </p>
          <Link
            to="/student/experiences"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            Explore Experiences
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base">{exp.companyId?.name}</span>
                  <span className="text-xs font-bold text-blue-600">• {exp.jobRole}</span>
                  <Badge status={exp.difficultyLevel} />
                </div>
                <p className="text-xs text-slate-400">
                  Author: {exp.studentId?.name} ({exp.studentId?.department}) • Class of {exp.selectionYear}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 italic">
                  "{exp.overallExperience}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  onClick={() => handleRemoveBookmark(exp._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  to={`/student/experiences/${exp._id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  Read Debrief <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
