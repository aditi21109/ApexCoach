import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { TrendingUp, Award, BarChart3 } from 'lucide-react';

const COLORS = [
  '#E0529C', // Pink
  '#131313', // Black/Charcoal
  '#4F6D7A', // Slate Blue
  '#C08A3E', // Dark Amber
  '#5C805C'  // Dark Green
];

export default function ProgressChart({ workouts }) {
  const [activeTab, setActiveTab] = useState('progression');
  const [selectedExercise, setSelectedExercise] = useState('');

  // Get unique exercises
  const uniqueExercises = useMemo(() => {
    const names = workouts.map(w => w.exercise_name);
    return [...new Set(names)].sort();
  }, [workouts]);

  // Set default selected exercise
  useMemo(() => {
    if (uniqueExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(uniqueExercises[0]);
    }
  }, [uniqueExercises, selectedExercise]);

  // Progression Data (line chart)
  const progressionData = useMemo(() => {
    if (!selectedExercise) return [];
    
    const filtered = workouts
      .filter(w => w.exercise_name.toLowerCase() === selectedExercise.toLowerCase())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const grouped = {};
    filtered.forEach(w => {
      const dateStr = w.date;
      if (!grouped[dateStr] || w.weight > grouped[dateStr].weight) {
        grouped[dateStr] = {
          date: dateStr,
          weight: w.weight,
          volume: w.sets * w.reps * w.weight
        };
      }
    });

    return Object.values(grouped);
  }, [workouts, selectedExercise]);

  // Muscle Volume Data (bar chart)
  const muscleGroupData = useMemo(() => {
    const distribution = {};
    workouts.forEach(w => {
      const muscle = w.muscle_group || 'Other';
      const vol = w.sets * w.reps * w.weight;
      if (!distribution[muscle]) {
        distribution[muscle] = { name: muscle, volume: 0 };
      }
      distribution[muscle].volume += vol;
    });

    return Object.values(distribution).map((item, index) => ({
      ...item,
      volume: parseFloat(item.volume.toFixed(1)),
      color: COLORS[index % COLORS.length]
    }));
  }, [workouts]);

  // Historical Total Volume (line chart)
  const volumeHistoryData = useMemo(() => {
    const groupedByDate = {};
    workouts.forEach(w => {
      const dateStr = w.date;
      const vol = w.sets * w.reps * w.weight;
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = { date: dateStr, volume: 0 };
      }
      groupedByDate[dateStr].volume += vol;
    });

    return Object.values(groupedByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        volume: parseFloat(item.volume.toFixed(1))
      }))
      .slice(-7); // Last 7 sessions
  }, [workouts]);

  // Format short date (e.g. "Jun 27")
  const formatShortDate = (dateStr) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Custom tooltips matching flat neobrutalism design
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#FAF6EE] border-2 border-[#131313] p-2.5 rounded-xl shadow-md text-xs space-y-0.5">
          <p className="font-bold text-[#131313]">{formatShortDate(label)}</p>
          {payload.map((p, i) => (
            <p key={i} className="font-semibold text-slate-700">
              {p.name}: <span className="font-bold text-[#131313]">{p.value} {p.unit || ''}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="light-panel p-6 flex flex-col h-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#131313]">Analytics Dashboard</h2>
          <p className="text-xs text-slate-500">Track muscular progression curves</p>
        </div>

        {/* Tab selector mirroring top search filters */}
        <div className="flex bg-[#FAF6EE] p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('progression')}
            className={`px-3 py-1.5 rounded-lg transition duration-150 flex items-center gap-1.5 ${
              activeTab === 'progression' ? 'bg-[#131313] text-[#FAF6EE]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Progression
          </button>
          <button
            onClick={() => setActiveTab('muscles')}
            className={`px-3 py-1.5 rounded-lg transition duration-150 flex items-center gap-1.5 ${
              activeTab === 'muscles' ? 'bg-[#131313] text-[#FAF6EE]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Muscles
          </button>
          <button
            onClick={() => setActiveTab('volume')}
            className={`px-3 py-1.5 rounded-lg transition duration-150 flex items-center gap-1.5 ${
              activeTab === 'volume' ? 'bg-[#131313] text-[#FAF6EE]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Volume
          </button>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-200 rounded-2xl flex-grow text-center">
          <TrendingUp className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-slate-500 font-semibold text-sm mb-0.5">No Telemetry Logs Yet</p>
          <p className="text-xs text-slate-400 max-w-xs">
            Start logging workouts to build your charts and track statistics.
          </p>
        </div>
      ) : (
        <div className="flex-grow min-h-[260px] flex flex-col justify-between">
          
          {/* Progression Curve */}
          {activeTab === 'progression' && (
            <div className="flex-grow flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Peak Lift Weight
                </span>
                {uniqueExercises.length > 0 && (
                  <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="bg-[#FAF6EE] border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none text-[#131313] font-bold focus:border-[#131313]"
                  >
                    {uniqueExercises.map(ex => (
                      <option key={ex} value={ex}>
                        {ex}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {progressionData.length === 0 ? (
                <div className="text-center py-14 text-slate-400 text-xs">
                  No data loaded. Logs will generate graph coordinates.
                </div>
              ) : (
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressionData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECEBE6" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        name="Peak Weight"
                        stroke="#131313"
                        strokeWidth={2.5}
                        dot={{ fill: '#FAF6EE', stroke: '#131313', strokeWidth: 2, r: 4.5 }}
                        activeDot={{ r: 6.5, fill: '#131313', stroke: '#FAF6EE' }}
                        unit=" lbs/kg"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Muscle Load Distribution */}
          {activeTab === 'muscles' && (
            <div className="flex-grow flex flex-col justify-between h-full">
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Volume by Area
                </span>
              </div>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={muscleGroupData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEBE6" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" name="Total Volume" radius={[6, 6, 0, 0]} unit=" lbs/kg">
                      {muscleGroupData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Daily Total Volume History */}
          {activeTab === 'volume' && (
            <div className="flex-grow flex flex-col justify-between h-full">
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Session Volume Trends
                </span>
              </div>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={volumeHistoryData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEBE6" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      name="Session Volume"
                      stroke="#4F6D7A"
                      strokeWidth={2}
                      dot={{ fill: '#FAF6EE', stroke: '#4F6D7A', strokeWidth: 1.5, r: 4 }}
                      unit=" lbs/kg"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
