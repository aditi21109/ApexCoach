import React from 'react';
import { Calendar, Trash2, Dumbbell, Activity, HeartHandshake } from 'lucide-react';

export default function WorkoutHistory({ workouts, onDeleteWorkout }) {
  const calculateVolume = (sets, reps, weight) => {
    return (sets * reps * weight).toFixed(0);
  };

  const formatDate = (dateStr) => {
    try {
      const options = { month: 'short', day: 'numeric' };
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString(undefined, options);
    } catch {
      return dateStr;
    }
  };

  // Icon selector based on muscle group
  const getGroupIcon = (muscle) => {
    switch (muscle?.toLowerCase()) {
      case 'cardio':
        return <Activity className="w-4.5 h-4.5" />;
      case 'core':
        return <HeartHandshake className="w-4.5 h-4.5" />;
      default:
        return <Dumbbell className="w-4.5 h-4.5" />;
    }
  };

  // Color mappings for circular background avatars
  const getAvatarStyle = (muscle) => {
    switch (muscle?.toLowerCase()) {
      case 'chest':
        return 'bg-[#B7CBEB] text-[#1E3A8A]'; // Blue pastel
      case 'back':
        return 'bg-[#F3C1E2] text-[#86198F]'; // Pink pastel
      case 'legs':
        return 'bg-[#FBE39A] text-[#78350F]'; // Yellow pastel
      case 'shoulders':
        return 'bg-[#BAC8A5] text-[#14532D]'; // Green pastel
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="light-panel p-6 flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#131313]">Training Logs</h2>
          <p className="text-xs text-slate-500">History of logged sets</p>
        </div>
        <div className="text-xs bg-[#131313] text-[#FAF6EE] font-bold px-3 py-1.5 rounded-full">
          {workouts.length} total
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-200 rounded-2xl flex-grow text-center">
          <Dumbbell className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-slate-500 font-semibold text-sm mb-0.5">Empty Logbook</p>
          <p className="text-xs text-slate-400 max-w-[240px]">
            Log your workouts using the sidebar panel to see them listed here.
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[380px] flex-grow pr-1 space-y-3">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between p-3 bg-[#FAF6EE]/50 hover:bg-[#FAF6EE] border border-slate-100 rounded-2xl transition duration-150 group"
            >
              {/* Left Side: Circular Avatar & Title info */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getAvatarStyle(workout.muscle_group)}`}>
                  {getGroupIcon(workout.muscle_group)}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#131313] tracking-wide">{workout.exercise_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">
                      {workout.muscle_group}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(workout.date)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Training Volume & Trash icon */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume</p>
                  <p className="text-sm font-extrabold text-[#131313]">
                    {calculateVolume(workout.sets, workout.reps, workout.weight)}{' '}
                    <span className="text-[10px] font-normal text-slate-500">lbs/kg</span>
                  </p>
                </div>
                
                <div className="hidden sm:block text-right border-l border-slate-200 pl-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metrics</p>
                  <p className="text-xs font-semibold text-slate-600">
                    {workout.sets}s × {workout.reps}r @ {workout.weight}
                  </p>
                </div>

                <button
                  onClick={() => onDeleteWorkout(workout.id)}
                  title="Delete workout log"
                  className="p-2 text-slate-400 hover:text-[#E0529C] hover:bg-rose-50 rounded-xl transition duration-150"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
