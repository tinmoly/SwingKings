import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔐 Supabase setup
// For sandboxed environments, use placeholder values or ensure network access
const SUPABASE_URL = "https://laeuijnohfgkmijyzxhm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZXVpam5vaGZna21panl6eGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3OTE4MDMsImV4cCI6MjA4NDM2NzgwM30.ZzkxAp9NihlrAXLC7lJGt6YdLZkbxqhn66waGs9QSeY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const golfers = [
  { id: 1, name: "Scottie Scheffler", rank: 1 },
  { id: 2, name: "Rory McIlroy", rank: 2 },
  { id: 3, name: "Jon Rahm", rank: 3 },
  { id: 4, name: "Viktor Hovland", rank: 4 },
  { id: 5, name: "Patrick Cantlay", rank: 5 },
  { id: 6, name: "Xander Schauffele", rank: 6 },
  { id: 7, name: "Collin Morikawa", rank: 7 },
  { id: 8, name: "Wyndham Clark", rank: 8 },
  { id: 9, name: "Max Homa", rank: 9 },
  { id: 10, name: "Justin Thomas", rank: 10 },
  { id: 11, name: "Matt Fitzpatrick", rank: 11 },
  { id: 15, name: "Tommy Fleetwood", rank: 15 },
  { id: 22, name: "Tony Finau", rank: 22 },
  { id: 28, name: "Cameron Young", rank: 28 },
  { id: 35, name: "Rickie Fowler", rank: 35 },
  { id: 42, name: "Sahith Theegala", rank: 42 }
];

function getBucket(min, max = Infinity) {
  return golfers.filter(g => g.rank >= min && g.rank <= max);
}

export default function SwingKingsDraft() {
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [picks, setPicks] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
          console.warn("Supabase URL or anon key not set. Skipping fetchUser.");
          return;
        }
        const { data } = await supabase.auth.getUser();
        if (data?.user) setUser(data.user);
      } catch (err) {
        console.error("Supabase fetch user failed:", err);
        alert("Unable to connect to Supabase. Please check your URL, anon key, and network connection.");
      }
    }
    fetchUser();
  }, []);

  const selectedIds = Object.values(picks);

  const slots = {
    top5: { label: "Top 1-5", list: getBucket(1, 5) },
    top10: { label: "Rank 6-10", list: getBucket(6, 10) },
    top20: { label: "Rank 11-20", list: getBucket(11, 20) },
    top30: { label: "Rank 21-30", list: getBucket(21, 30) },
    outside: { label: "Outside Top 30", list: getBucket(31) }
  };

  async function signUpOrLogin() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return alert("Supabase not configured.");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: { data: { username: authForm.name, phone: authForm.phone } }
      });
      if (error) throw error;
      setUser(data.user);
    } catch (err) {
      alert(err.message);
    }
  }

  async function forgotPassword() {
    if (!authForm.email) return alert("Please enter your email first");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return alert("Supabase not configured.");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authForm.email);
      if (error) throw error;
      alert("Password reset email sent!");
    } catch (err) {
      alert(err.message);
    }
  }

  async function saveLineup() {
    if (!user) return;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return alert("Supabase not configured.");
    try {
      const { error } = await supabase.from("lineups").insert({
        user_id: user.id,
        tournament_id: "demo_tournament_001",
        picks,
        timestamp: new Date().toISOString()
      });
      if (error) throw error;
      alert("Lineup saved successfully!");
    } catch (err) {
      alert(err.message);
    }
  }

  function selectGolfer(slot, golferId) {
    setPicks(prev => ({ ...prev, [slot]: golferId }));
    setActiveSlot(null);
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4 bg-[#0F3D2E] min-h-screen">
        <h1 className="text-xl font-bold text-white">SwingKings Fantasy Golf League Draft</h1>
        <input className="w-full rounded-xl p-3 bg-white text-black" placeholder="Username" onChange={e => setAuthForm({ ...authForm, name: e.target.value })} />
        <input className="w-full rounded-xl p-3 bg-white text-black" placeholder="Email" type="email" onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
        <input className="w-full rounded-xl p-3 bg-white text-black" placeholder="Mobile Number" type="tel" onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} />

        <div className="relative">
          <input className="w-full rounded-xl p-3 bg-white text-black pr-14" placeholder="Password" type={showPassword ? "text" : "password"} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E6F5C] font-medium">
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="button" onClick={forgotPassword} className="text-sm text-[#1E6F5C] underline">Forgot password?</button>

        <button onClick={signUpOrLogin} disabled={!authForm.email || !authForm.password} className="w-full bg-[#1E6F5C] text-white rounded-xl p-3 font-semibold">Continue</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 bg-[#0F3D2E] min-h-screen">
      <h1 className="text-xl font-bold text-white">SwingKings Fantasy Golf League Draft</h1>
      {Object.entries(slots).map(([slot, data]) => (
        <button key={slot} onClick={() => setActiveSlot(slot)} className="w-full rounded-xl border border-[#1E6F5C] bg-white/95 p-3 text-left shadow">
          <div className="text-sm font-medium">{data.label}</div>
          <div className="text-[#1E6F5C] text-sm">{picks[slot] ? golfers.find(g => g.id === picks[slot]).name : "Tap to select"}</div>
        </button>
      ))}

      <button onClick={saveLineup} disabled={Object.keys(picks).length !== 5} className="w-full bg-[#1E6F5C] text-white rounded-xl p-3 font-semibold">Save Lineup</button>

      {activeSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-end">
          <div className="bg-[#F8FAF9] w-full rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="text-center font-semibold mb-2">{slots[activeSlot].label}</div>
            {slots[activeSlot].list.filter(g => !selectedIds.includes(g.id) || picks[activeSlot] === g.id).map(g => (
              <button key={g.id} onClick={() => selectGolfer(activeSlot, g.id)} className="w-full text-left p-3 rounded-lg hover:bg-[#D1FAE5]">#{g.rank} {g.name}</button>
            ))}
            <button onClick={() => setActiveSlot(null)} className="w-full mt-4 text-sm text-[#1E6F5C]">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
