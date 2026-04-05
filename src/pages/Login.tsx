import { useState } from "react";
import { supabase } from "../utils/supabase";
import LoadingGif from "../assets/loading.gif";

export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.username,
      password: form.password,
    });

    setLoading(false);
    if (error) {
      setLoading(false);
      throw error;
    }
    return data;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6 container mx-auto flex items-center justify-center">
      <div className="bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-sm flex flex-col items-center">
        <h2 className="text-3xl font-semibold mb-8">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full text-lg mb-4 p-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full text-lg mb-4 p-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleLogin}
          className="mt-4 w-full bg-indigo-600 px-4 py-2 rounded-lg shadow hover:bg-indigo-500 transition text-lg font-medium"
        >
          Login
        </button>
      </div>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative">
            <img className="w-20" src={LoadingGif} alt="Loading..." />
          </div>
        </div>
      )}
    </div>
  );
}
