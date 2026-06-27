import React, { useState } from 'react';
import { Target, Calendar, CheckCircle2, Circle, Plus, Trash2, Loader2 } from 'lucide-react';

const GOAL_TYPES = [
  'Weight Progression',
  'Workout Volume',
  'Weekly Frequency',
  'Bodyweight target'
];

export default function GoalTracker({ userId, goals, onAddGoal, onToggleGoal, onDeleteGoal }) {
  const [goalType, setGoalType] = useState(GOAL_TYPES[0]);
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!target.trim() || !deadline) {
      setError('Required fields missing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const goalData = {
        user_id: userId,
        goal_type: goalType,
        target: target.trim(),
        deadline: deadline,
        completed: false
      };

      await onAddGoal(goalData);
      setTarget('');
      setDeadline('');
    } catch (err) {
      console.error(err);
      setError('Failed to create goal.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pastel-green p-6 flex flex-col h-full animate-fade-in text-[#1A3322]">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-[#FAF6EE] text-[#5C805C] rounded-xl">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold tracking-tight">Fitness Targets</h2>
          <p className="text-xs opacity-75">Milestones & achievements</p>
        </div>
      </div>

      {/* Goal Add Form */}
      <form onSubmit={handleSubmit} className="mb-5 space-y-2 bg-[#FAF6EE]/40 p-3.5 rounded-2xl border border-[#BAC8A5]/40">
        {error && <div className="text-xs text-red-700">{error}</div>}
        
        <div className="grid grid-cols-2 gap-2">
          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
            className="w-full bg-[#FAF6EE] border border-[#BAC8A5] focus:border-[#131313] rounded-xl px-2.5 py-2 outline-none text-xs text-[#131313] font-semibold"
          >
            {GOAL_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-[#FAF6EE] border border-[#BAC8A5] focus:border-[#131313] rounded-xl px-2.5 py-2 outline-none text-xs text-[#131313] font-semibold"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            required
            placeholder="e.g. Squat 225 lbs, weight 170"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-grow bg-[#FAF6EE] border border-[#BAC8A5] focus:border-[#131313] rounded-xl px-3 py-2 outline-none text-xs text-[#131313] placeholder-slate-400 font-semibold"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#131313] hover:bg-[#2A2A2A] text-[#FAF6EE] font-bold px-3 py-2 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-0.5 active:scale-[0.97]"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Goals List */}
      <div className="flex-grow overflow-y-auto max-h-[300px] pr-1 space-y-2.5">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 bg-[#FAF6EE]/20 border border-dashed border-[#BAC8A5]/40 rounded-2xl text-center">
            <Target className="w-8 h-8 text-[#5C805C] opacity-50 mb-1.5" />
            <p className="font-bold text-xs">No Active Targets</p>
          </div>
        ) : (
          goals.map(goal => (
            <div
              key={goal.id}
              className={`flex items-start justify-between p-3 border rounded-xl transition duration-150 ${
                goal.completed
                  ? 'bg-[#FAF6EE]/30 border-transparent text-[#5C805C]/70'
                  : 'bg-[#FAF6EE] border-transparent text-[#1A3322]'
              }`}
            >
              <div className="flex items-start gap-2.5 flex-grow pr-2">
                <button
                  onClick={() => onToggleGoal(goal.id)}
                  className="mt-0.5 hover:opacity-85 transition duration-150 shrink-0"
                >
                  {goal.completed ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#3D563D]" />
                  ) : (
                    <Circle className="w-4.5 h-4.5 text-[#5C805C]" />
                  )}
                </button>

                <div className="space-y-0.5">
                  <p className={`text-xs font-bold leading-tight ${goal.completed ? 'line-through opacity-60' : ''}`}>
                    {goal.target}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] opacity-75">
                    <span className="bg-[#FAF6EE]/50 px-1.5 py-0.5 rounded border border-[#BAC8A5]/30">
                      {goal.goal_type}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {formatDate(goal.deadline)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteGoal(goal.id)}
                className="text-[#5C805C] hover:text-red-700 p-1 rounded transition duration-150 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
