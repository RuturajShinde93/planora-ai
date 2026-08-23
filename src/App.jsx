import React, { useState, useEffect } from 'react';
import { generateTripPlan } from './lib/gemini';
import { supabase } from './lib/db';
import { 
  Plane, Hotel, MapPin, Calendar, Users, Wallet, 
  Sparkles, Trash2, LogOut, Lock, Mail, ArrowRight, CheckCircle2 
} from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Planner state
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(4);
  const [budget, setBudget] = useState('Moderate');
  const [travelType, setTravelType] = useState('Couple');
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);

  // Check auth on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchTrips(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchTrips(session.user.id);
      else setSavedTrips([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchTrips(userId) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) setSavedTrips(data);
  }

  async function handleAuth(e) {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link or log in directly if confirmation is disabled.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentPlan(null);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (!user) {
      alert('Please log in to generate and save trip itineraries.');
      return;
    }

    setLoading(true);
    try {
      const plan = await generateTripPlan(destination, duration, budget, travelType);
      setCurrentPlan(plan);

      const { data, error } = await supabase
        .from('trips')
        .insert([
          {
            destination,
            duration: Number(duration),
            budget,
            plan_data: plan,
            user_id: user.id
          },
        ])
        .select();

      if (!error && data) {
        setSavedTrips((prev) => [data[0], ...prev]);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate trip plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTrip(id) {
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (!error) {
      setSavedTrips((prev) => prev.filter((t) => t.id !== id));
      if (currentPlan && savedTrips.find((t) => t.id === id)?.plan_data?.tripTitle === currentPlan?.tripTitle) {
        setCurrentPlan(null);
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased text-slate-800">
      {/* MakeMyTrip Style Header */}
      <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
         <div className="flex items-center gap-2.5">
  <Plane size={24} className="text-blue-400" />
  <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
    Planora <span className="text-blue-400">AI</span>
  </h1>
  <span className="text-xs uppercase tracking-widest font-semibold text-slate-300 hidden sm:inline border-l border-slate-600 pl-2">
    AI Trip Planner
  </span>
</div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 hidden md:inline">
                  Welcome, <strong className="text-white">{user.email}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-red-600 rounded-full transition border border-slate-700"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-300 font-medium">Log in below to save trips</span>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner with Search Section */}
      <div className="relative bg-gradient-to-b from-blue-900 via-indigo-900 to-blue-800 pb-28 pt-10 px-4">
        <div className="max-w-4xl mx-auto text-center text-white mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
            Where do you want to explore?
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Instant AI travel itineraries, hotel recommendations, and cost estimates
          </p>
        </div>

        {/* Floating MMT-style Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
          <div className="flex gap-4 border-b pb-4 mb-6 overflow-x-auto text-sm font-semibold text-slate-600">
            <span className="flex items-center gap-2 text-blue-600 border-b-2 border-blue-600 pb-2 cursor-pointer">
              <Plane size={18} /> Holiday Packages
            </span>
            <span className="flex items-center gap-2 hover:text-blue-600 cursor-pointer pb-2">
              <Hotel size={18} /> Stays Included
            </span>
          </div>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Destination */}
            <div className="border border-slate-200 hover:border-blue-500 rounded-xl p-3 bg-slate-50">
              <label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1">
                <MapPin size={14} className="text-red-500" /> City or Country
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Manali, Goa, Paris"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-800 focus:outline-none mt-1"
              />
            </div>

            {/* Duration */}
            <div className="border border-slate-200 hover:border-blue-500 rounded-xl p-3 bg-slate-50">
              <label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1">
                <Calendar size={14} className="text-blue-500" /> Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-800 focus:outline-none mt-1"
              />
            </div>

            {/* Budget */}
            <div className="border border-slate-200 hover:border-blue-500 rounded-xl p-3 bg-slate-50">
              <label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1">
                <Wallet size={14} className="text-emerald-500" /> Budget Tier
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-800 focus:outline-none mt-1"
              >
                <option value="Backpacker / Budget">Economy</option>
                <option value="Moderate">Standard</option>
                <option value="Luxury / Premium">Luxury</option>
              </select>
            </div>

            {/* Travel Group */}
            <div className="border border-slate-200 hover:border-blue-500 rounded-xl p-3 bg-slate-50">
              <label className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1">
                <Users size={14} className="text-purple-500" /> Travellers
              </label>
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-800 focus:outline-none mt-1"
              >
                <option value="Solo">Solo Explorer</option>
                <option value="Couple">Couple</option>
                <option value="Family with Kids">Family</option>
                <option value="Friends Group">Friends</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-4 flex justify-center mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-1/3 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-full shadow-lg transition duration-200 flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
              >
                {loading ? (
                  <>Building Itinerary...</>
                ) : (
                  <>
                    <Sparkles size={18} /> Search & Plan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Trip Display */}
        <div className="lg:col-span-2 space-y-6">
          {currentPlan ? (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-6">
              <div className="border-b pb-4">
                <span className="text-xs uppercase tracking-wider font-extrabold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                  AI Confirmed Itinerary
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                  {currentPlan.tripTitle}
                </h2>
                <p className="text-slate-600 text-sm mt-1">{currentPlan.overview}</p>
                <div className="flex gap-4 mt-3 text-xs font-semibold text-slate-500">
                  <span>🗓 Best Time: <strong>{currentPlan.bestTimeToVisit}</strong></span>
                  <span>💰 Est. Cost: <strong className="text-emerald-600">{currentPlan.estimatedCost}</strong></span>
                </div>
              </div>

              {/* Recommended Hotels */}
              {currentPlan.hotelRecommendations?.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <Hotel size={18} className="text-blue-600" /> Recommended Stays
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentPlan.hotelRecommendations.map((hotel, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-slate-800">{hotel.name}</h4>
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                            {hotel.rating}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{hotel.description}</p>
                        <span className="text-xs font-bold text-blue-600 mt-2 block">{hotel.priceRange}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day-by-Day Schedule */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-600" /> Day Wise Plan
                </h3>
                {currentPlan.itinerary?.map((day) => (
                  <div key={day.day} className="border-l-4 border-blue-600 pl-4 py-2 bg-slate-50 rounded-r-xl">
                    <h4 className="font-bold text-slate-900 text-base">Day {day.day}: {day.theme}</h4>
                    <div className="mt-2 space-y-2">
                      {day.activities?.map((act, idx) => (
                        <div key={idx} className="flex gap-2 text-sm text-slate-600">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>
                            {act.time && <strong className="text-slate-700">{act.time}: </strong>}
                            {typeof act === 'string' ? act : act.plan}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
              <Plane size={48} className="mx-auto text-blue-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No active itinerary selected</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter your preferred destination above and hit <strong>Search & Plan</strong> to generate an AI travel blueprint.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: User Auth & Saved Trips */}
        <div className="space-y-6">
          {/* User Auth Card */}
          {!user && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Lock size={18} className="text-blue-600" /> {isSignUp ? 'Create Account' : 'Login to Save Trips'}
              </h3>
              <form onSubmit={handleAuth} className="space-y-3 mt-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">Email Address</label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-slate-50 mt-1">
                    <Mail size={16} className="text-slate-400" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Password</label>
                  <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-slate-50 mt-1">
                    <Lock size={16} className="text-slate-400" />
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition"
                >
                  {authLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
                </button>

                <p className="text-xs text-center text-slate-500 pt-1">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    {isSignUp ? 'Log In' : 'Sign Up'}
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* Saved Trips from Supabase */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg flex items-center justify-between">
              <span>My Saved Bookings</span>
              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {savedTrips.length}
              </span>
            </h3>

            {savedTrips.length === 0 ? (
              <p className="text-xs text-slate-400 mt-3">
                {user ? 'No saved trips yet. Generate one above!' : 'Sign in to sync your saved itineraries.'}
              </p>
            ) : (
              <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-1">
                {savedTrips.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-500 transition flex justify-between items-center group cursor-pointer"
                  >
                    <div onClick={() => setCurrentPlan(item.plan_data)} className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800">{item.destination}</h4>
                      <p className="text-xs text-slate-500">
                        {item.duration} Days • {item.budget}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteTrip(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-white"
                        title="Delete Trip"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}