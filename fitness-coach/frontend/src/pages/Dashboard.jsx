import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Dumbbell,
  Target,
  Award,
  Flame,
  Settings,
  X,
  UserCheck,
  TrendingUp,
  Search,
  Calendar as CalendarIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LayoutGrid,
  ClipboardList,
  MessageCircle,
  BarChart3,
  Sliders,
  User,
  Plus
} from 'lucide-react';
import { workoutService, goalService, userService } from '../services/api';
import WorkoutForm from '../components/WorkoutForm';
import WorkoutHistory from '../components/WorkoutHistory';
import ProgressChart from '../components/ProgressChart';
import GoalTracker from '../components/GoalTracker';
import AICoach from '../components/AICoach';

export default function Dashboard() {
  const [userId, setUserId] = useState(() => {
    const saved = localStorage.getItem('fitness_coach_user_id');
    return saved || '';
  });

  const [workouts, setWorkouts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [profile, setProfile] = useState({
    user_id: '',
    name: 'Guest',
    email: '',
    age: 25,
    fitness_goal: ''
  });

  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Login Form States
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Toggle between Login and Register
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginAge, setLoginAge] = useState('');
  const [loginGoal, setLoginGoal] = useState('');

  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');

  // Sidebar navigation state (e.g. 'dashboard' or 'coach' view)
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load dashboard data
  useEffect(() => {
    if (!userId) return;
    const loadDashboardData = async () => {
      try {
        const [workoutList, goalList, userProfile] = await Promise.all([
          workoutService.getWorkouts(userId),
          goalService.getGoals(userId),
          userService.getProfile(userId)
        ]);

        setWorkouts(workoutList);
        setGoals(goalList);
        setProfile(userProfile);

        setEditName(userProfile.name);
        setEditEmail(userProfile.email);
        setEditAge(userProfile.age);
        setEditGoal(userProfile.fitness_goal);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    loadDashboardData();
  }, [userId]);

  const handleEmailLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      alert("Please enter your email address");
      return;
    }
    setSaveLoading(true);
    try {
      const userProfile = await userService.getProfileByEmail(loginEmail.trim().toLowerCase());
      
      localStorage.setItem('fitness_coach_user_id', userProfile.user_id);
      setProfile(userProfile);
      setEditName(userProfile.name);
      setEditEmail(userProfile.email);
      setEditAge(userProfile.age);
      setEditGoal(userProfile.fitness_goal);
      setUserId(userProfile.user_id);
    } catch (err) {
      console.error(err);
      alert('Login failed. No athlete found with this email. Click "Create Profile" to register.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!loginName.trim() || !loginEmail.trim() || !loginAge || !loginGoal.trim()) {
      alert("Please fill out all registration fields");
      return;
    }
    const generatedId = 'user_' + Math.random().toString(36).substring(2, 9);
    setSaveLoading(true);
    try {
      const userProfile = {
        user_id: generatedId,
        name: loginName.trim(),
        email: loginEmail.trim(),
        age: parseInt(loginAge, 10),
        fitness_goal: loginGoal.trim()
      };
      
      const saved = await userService.saveProfile(userProfile);
      
      localStorage.setItem('fitness_coach_user_id', generatedId);
      setProfile(saved);
      setEditName(saved.name);
      setEditEmail(saved.email);
      setEditAge(saved.age);
      setEditGoal(saved.fitness_goal);
      setUserId(generatedId);
    } catch (err) {
      console.error(err);
      alert('Registration failed. Make sure the backend server is running.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('fitness_coach_user_id');
    setUserId('');
    setWorkouts([]);
    setGoals([]);
    setProfile({
      user_id: '',
      name: 'Guest',
      email: '',
      age: 25,
      fitness_goal: ''
    });
    setLoginName('');
    setLoginEmail('');
    setLoginAge('');
    setLoginGoal('');
  };

  // Workout CRUD Actions
  const handleWorkoutAdded = async (workoutData) => {
    const created = await workoutService.addWorkout(workoutData);
    setWorkouts(prev => [created, ...prev]);
  };

  const handleWorkoutDeleted = async (id) => {
    await workoutService.deleteWorkout(id);
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  // Goal CRUD Actions
  const handleGoalAdded = async (goalData) => {
    const created = await goalService.addGoal(goalData);
    setGoals(prev => [created, ...prev]);
  };

  const handleGoalToggled = async (id) => {
    const updated = await goalService.toggleGoal(id);
    setGoals(prev => prev.map(g => g.id === id ? updated : g));
  };

  const handleGoalDeleted = async (id) => {
    await goalService.deleteGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Profile Save Action
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const updatedProfile = {
        user_id: userId,
        name: editName,
        email: editEmail,
        age: parseInt(editAge, 10),
        fitness_goal: editGoal
      };
      const saved = await userService.saveProfile(updatedProfile);
      setProfile(saved);
      setProfileOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile settings");
    } finally {
      setSaveLoading(false);
    }
  };

  // Calculated Stats
  const stats = useMemo(() => {
    const totalW = workouts.length;
    const completedG = goals.filter(g => g.completed).length;
    const pendingG = goals.filter(g => !g.completed).length;
    const totalVol = workouts.reduce((sum, w) => sum + (w.sets * w.reps * w.weight), 0);
    
    // Calculate sessions in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyW = workouts.filter(w => new Date(w.date) >= sevenDaysAgo).length;

    // Highest frequency muscle group
    const muscleCounts = {};
    workouts.forEach(w => {
      muscleCounts[w.muscle_group] = (muscleCounts[w.muscle_group] || 0) + 1;
    });
    let topMuscle = 'N/A';
    let maxCount = 0;
    Object.entries(muscleCounts).forEach(([m, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topMuscle = m;
      }
    });

    return {
      totalWorkouts: totalW,
      weeklyWorkouts: weeklyW,
      totalVolume: (totalVol / 1000).toFixed(1) + 'k', // formatted (e.g. 12.4k)
      completedGoals: completedG,
      pendingGoals: pendingG,
      topMuscle: topMuscle
    };
  }, [workouts, goals]);

  // Filtered workouts list based on top search bar + pill tags
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => {
      const matchesSearch = w.exercise_name.toLowerCase().includes(searchText.toLowerCase());
      const matchesMuscle = muscleFilter === 'All' || w.muscle_group.toLowerCase() === muscleFilter.toLowerCase();
      return matchesSearch && matchesMuscle;
    });
  }, [workouts, searchText, muscleFilter]);

  // Greeting based on current time
  const timeGreeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Calendar Date helper
  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    
    const numDays = endOfMonth.getDate();
    const startDayOfWeek = startOfMonth.getDay(); // 0 is Sunday
    
    // Shift days so Monday is first
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const days = [];
    // Pad previous month days
    for (let i = 0; i < offset; i++) {
      days.push({ dayNum: '', isCurrent: false });
    }
    // Add current month days
    const todayDate = now.getDate();
    for (let d = 1; d <= numDays; d++) {
      days.push({ dayNum: d, isCurrent: true, isToday: d === todayDate });
    }
    return days;
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6EE] p-6 flex gap-6 text-[#1E1E24] overflow-hidden max-w-[1600px] mx-auto">
      
      {/* 1. Left Sidebar panel */}
      <aside className="w-[240px] shrink-0 dark-sidebar p-6 flex flex-col justify-between h-[calc(100vh-48px)] sticky top-6 z-10">
        <div className="space-y-8">
          {/* Logo container */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FAF6EE] flex items-center justify-center text-slate-900 shadow-sm font-black">
                A
              </div>
              <span className="font-extrabold tracking-wider text-base text-white">apex</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#E0529C]"></div>
          </div>

          {/* Navigation link blocks */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">General</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition ${
                    activeTab === 'dashboard' ? 'bg-[#FAF6EE]/15 text-[#FAF6EE]' : 'text-slate-400 hover:text-[#FAF6EE]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('workouts')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition ${
                    activeTab === 'workouts' ? 'bg-[#FAF6EE]/15 text-[#FAF6EE]' : 'text-slate-400 hover:text-[#FAF6EE]'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Workouts logs</span>
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition ${
                    activeTab === 'goals' ? 'bg-[#FAF6EE]/15 text-[#FAF6EE]' : 'text-slate-400 hover:text-[#FAF6EE]'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Milestones</span>
                </button>
              </nav>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">Tools</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('coach')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition ${
                    activeTab === 'coach' ? 'bg-[#FAF6EE]/15 text-[#FAF6EE]' : 'text-slate-400 hover:text-[#FAF6EE]'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Aegis Chat</span>
                </button>
                <button
                  onClick={() => setProfileOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition"
                >
                  <User className="w-4 h-4" />
                  <span>Profile Settings</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Footer logout */}
        <div className="border-t border-slate-800 pt-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 text-xs font-bold">
              {profile.name[0]}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-200 truncate max-w-[120px]">{profile.name}</p>
              <p className="text-[9px] text-slate-500 font-semibold">{profile.age} years old</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-[#E0529C] text-xs font-semibold rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main content center grid */}
      <main className="flex-grow flex flex-col gap-6 overflow-y-auto h-[calc(100vh-48px)] pr-1">
        
        {/* Top Search bar / Filter row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Custom Search capsule */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search exercise..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-[#FAF6EE] border border-slate-200 focus:border-slate-800 rounded-full pl-10 pr-4 py-2.5 text-xs outline-none text-[#131313] font-semibold"
            />
          </div>

          {/* Muscle Group Filter tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white p-1 rounded-full border border-slate-100 shadow-sm shrink-0">
            {['All', 'Chest', 'Back', 'Legs', 'Shoulders'].map(tag => (
              <button
                key={tag}
                onClick={() => setMuscleFilter(tag)}
                className={`px-3 py-1.5 rounded-full transition ${
                  muscleFilter === tag ? 'bg-[#131313] text-[#FAF6EE]' : 'hover:text-slate-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Greeting Banner */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#131313]">
            {timeGreeting}, {profile.name}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Let's keep pushing towards your fitness target: "{profile.fitness_goal}"
          </p>
        </div>

        {/* 4 Pastel Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Workouts count (Yellow) */}
          <div className="pastel-yellow p-5 flex flex-col justify-between h-[130px] text-[#5C4D20]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Sessions</p>
              <p className="text-3xl font-black mt-1 tracking-tight">{stats.totalWorkouts}</p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span>Weekly Count: {stats.weeklyWorkouts}</span>
              <span className="bg-[#FAF6EE]/50 px-2 py-0.5 rounded-full">Freq</span>
            </div>
          </div>

          {/* Card 2: Progress load stats (Pink) */}
          <div className="pastel-pink p-5 flex flex-col justify-between h-[130px] text-[#5C2B4E]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Training Volume</p>
              <p className="text-3xl font-black mt-1 tracking-tight">{stats.totalVolume}</p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span>Metric: Lbs / Kg</span>
              <span className="bg-[#FAF6EE]/50 px-2 py-0.5 rounded-full">Load</span>
            </div>
          </div>

          {/* Card 3: Target milestones (Green) */}
          <div className="pastel-green p-5 flex flex-col justify-between h-[130px] text-[#1A3322]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Milestones Met</p>
              <p className="text-3xl font-black mt-1 tracking-tight">{stats.completedGoals}</p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span>Pending: {stats.pendingGoals} goals</span>
              <span className="bg-[#FAF6EE]/50 px-2 py-0.5 rounded-full">Goals</span>
            </div>
          </div>

          {/* Card 4: Load breakdown (Blue) */}
          <div className="pastel-blue p-5 flex flex-col justify-between h-[130px] text-[#1F3A60]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Core Muscle Group</p>
              <p className="text-2xl font-black mt-1 tracking-tight truncate">{stats.topMuscle}</p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span>Dominant load focus</span>
              <span className="bg-[#FAF6EE]/50 px-2 py-0.5 rounded-full">Split</span>
            </div>
          </div>
        </div>

        {/* Tab view filters */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Progress Chart & History */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <ProgressChart workouts={workouts} />
              <WorkoutHistory workouts={filteredWorkouts} onDeleteWorkout={handleWorkoutDeleted} />
            </div>

            {/* Right: AI Coach chat & Goals */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <AICoach userId={userId} workoutCount={workouts.length} />
              <GoalTracker
                userId={userId}
                goals={goals}
                onAddGoal={handleGoalAdded}
                onToggleGoal={handleGoalToggled}
                onDeleteGoal={handleGoalDeleted}
              />
            </div>
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <WorkoutHistory workouts={filteredWorkouts} onDeleteWorkout={handleWorkoutDeleted} />
            </div>
            <div className="lg:col-span-4">
              <WorkoutForm userId={userId} onWorkoutAdded={handleWorkoutAdded} />
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <GoalTracker
                userId={userId}
                goals={goals}
                onAddGoal={handleGoalAdded}
                onToggleGoal={handleGoalToggled}
                onDeleteGoal={handleGoalDeleted}
              />
            </div>
            <div className="lg:col-span-4">
              <WorkoutForm userId={userId} onWorkoutAdded={handleWorkoutAdded} />
            </div>
          </div>
        )}

        {activeTab === 'coach' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <AICoach userId={userId} workoutCount={workouts.length} />
            </div>
            <div className="lg:col-span-4">
              <ProgressChart workouts={workouts} />
            </div>
          </div>
        )}
      </main>

      {/* 3. Right Sidebar: Calendar panel & Timeline log */}
      <aside className="w-[300px] shrink-0 bg-white border border-slate-100 rounded-[28px] p-5 flex flex-col gap-6 h-[calc(100vh-48px)] sticky top-6 z-10 overflow-y-auto">
        {/* Calendar widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-800">
                {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-2.5 text-center text-[10px] font-bold text-slate-400">
            {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(d => (
              <span key={d}>{d}</span>
            ))}
            {calendarDays.map((cd, i) => (
              <div
                key={i}
                className="flex items-center justify-center h-6 w-full"
              >
                {cd.dayNum && (
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full transition text-[10px] font-bold ${
                      cd.isToday
                        ? 'bg-[#E0529C] text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    {cd.dayNum}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setActiveTab('workouts')}
          className="w-full bg-[#131313] hover:bg-[#2C2C2C] active:scale-[0.98] transition text-[#FAF6EE] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Workout</span>
        </button>

        {/* Timeline Log */}
        <div className="flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-wide">Today's Timeline</h3>
            
            {workouts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-[10px]">
                No sessions completed today.
              </div>
            ) : (
              <div className="space-y-4 pl-3 relative border-l border-slate-100 ml-2">
                {workouts.slice(0, 4).map((w, index) => (
                  <div key={w.id} className="relative space-y-1">
                    {/* Timeline Node dot */}
                    <div className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      index === 0 ? 'bg-[#E0529C]' : 'bg-slate-400'
                    }`}></div>
                    
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                      {w.date}
                    </p>
                    <p className="text-xs font-extrabold text-[#131313]">
                      {w.exercise_name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {w.sets} sets × {w.reps} reps ({w.muscle_group})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('workouts')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-[#131313] font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition text-center"
          >
            View all details
          </button>
        </div>
      </aside>

      {/* User Profile drawer modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setProfileOpen(false)}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-sm bg-white border-l border-slate-100 flex flex-col shadow-2xl p-6 h-full animate-fade-in text-[#1E1E24]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-slate-800" />
                <h2 className="text-base font-extrabold tracking-tight">Edit Profile</h2>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 flex-grow">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full flat-input px-3.5 py-2.5 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full flat-input px-3.5 py-2.5 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full flat-input px-3.5 py-2.5 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userId}
                    className="w-full bg-slate-50 border border-transparent rounded-xl px-3.5 py-2.5 text-xs text-slate-400 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Primary target
                </label>
                <textarea
                  required
                  rows="3"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  className="w-full flat-input px-3.5 py-2.5 text-xs font-semibold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="w-full bg-[#131313] hover:bg-[#2C2C2C] text-[#FAF6EE] font-bold py-3.5 rounded-xl transition duration-150 flex items-center justify-center mt-4"
              >
                {saveLoading ? 'Updating...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Landing Sign-in form if user is not authenticated */}
      {!userId && (
        <div className="fixed inset-0 z-50 bg-[#FAF6EE] flex items-center justify-center p-6 text-[#1E1E24]">
          <div className="light-panel p-8 max-w-md w-full animate-fade-in space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3.5 bg-[#131313] rounded-2xl text-[#FAF6EE] shadow-md">
                <Dumbbell className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Apex Coach</h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">Manage your training telemetry logs</p>
              </div>
            </div>

            {/* Login vs Register Tabs */}
            <div className="flex bg-[#FAF6EE] p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setError(''); }}
                className={`flex-1 py-2 rounded-lg transition duration-150 ${
                  !isRegisterMode ? 'bg-[#131313] text-[#FAF6EE]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setError(''); }}
                className={`flex-1 py-2 rounded-lg transition duration-150 ${
                  isRegisterMode ? 'bg-[#131313] text-[#FAF6EE]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Profile
              </button>
            </div>

            {!isRegisterMode ? (
              /* Existing Athlete Login Form */
              <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. olivia@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full flat-input px-3.5 py-2.5 text-sm font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-full bg-[#131313] hover:bg-[#2C2C2C] text-[#FAF6EE] font-bold py-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10"
                >
                  {saveLoading ? 'Searching...' : 'Enter Dashboard'}
                </button>
              </form>
            ) : (
              /* New Athlete Registration Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Olivia Wilde"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full flat-input px-3.5 py-2.5 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="olivia@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full flat-input px-3.5 py-2.5 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="e.g. 28"
                    value={loginAge}
                    onChange={(e) => setLoginAge(e.target.value)}
                    className="w-full flat-input px-3.5 py-2.5 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Primary Fitness Goal
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g. Build muscle mass and focus on leg strength"
                    value={loginGoal}
                    onChange={(e) => setLoginGoal(e.target.value)}
                    className="w-full flat-input px-3.5 py-2.5 text-xs font-semibold resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-full bg-[#131313] hover:bg-[#2C2C2C] text-[#FAF6EE] font-bold py-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10"
                >
                  {saveLoading ? 'Creating profile...' : 'Register & Enter'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
