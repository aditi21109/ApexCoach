import React, { useState } from 'react';
import { Dumbbell, PlusCircle, Loader2 } from 'lucide-react';

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio'
];

export default function WorkoutForm({ userId, onWorkoutAdded }) {
  const [exerciseName, setExerciseName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState(MUSCLE_GROUPS[0]);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exerciseName.trim() || !sets || !reps || !weight || !date) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const workoutData = {
        user_id: userId,
        exercise_name: exerciseName.trim(),
        muscle_group: muscleGroup,
        sets: parseInt(sets, 10),
        reps: parseInt(reps, 10),
        weight: parseFloat(weight),
        date: date
      };

      await onWorkoutAdded(workoutData);
      setExerciseName('');
      setSets('');
      setReps('');
      setWeight('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to log workout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="light-panel p-6 flex flex-col h-full animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-[#FAF6EE] border border-slate-100 rounded-xl text-[#131313]">
          <Dumbbell className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#131313]">Record Lift</h2>
          <p className="text-xs text-slate-500">Log training metrics</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-3.5">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold">
              Workout logged successfully!
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Exercise Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bench Press, Squat, Pull-ups"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              disabled={loading}
              className="w-full flat-input px-3.5 py-2.5 text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Muscle
              </label>
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
                disabled={loading}
                className="w-full flat-input px-3.5 py-2.5 text-sm font-semibold"
              >
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg} value={mg}>
                    {mg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                className="w-full flat-input px-3.5 py-2.5 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Sets
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="0"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                disabled={loading}
                className="w-full flat-input px-3 py-2.5 text-sm font-semibold text-center"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Reps
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="0"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                disabled={loading}
                className="w-full flat-input px-3 py-2.5 text-sm font-semibold text-center"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Weight
              </label>
              <input
                type="number"
                required
                step="any"
                min="0"
                placeholder="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={loading}
                className="w-full flat-input px-3 py-2.5 text-sm font-semibold text-center"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#131313] hover:bg-[#2C2C2C] active:scale-[0.98] transition duration-200 text-[#FAF6EE] font-bold py-3.5 rounded-xl flex items-center justify-center gap-1.5 mt-4 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <PlusCircle className="w-4.5 h-4.5" />
              <span>Log Session</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
