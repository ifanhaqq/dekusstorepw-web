import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "../utils/supabase";
import LoadingGif from "../assets/loading.gif";

type Props = {
  handleSetPassword: (password: string) => void;
};

export default function Login({ handleSetPassword }: Props) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const hCaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!form.username || !form.password) return;

    if (!captchaToken) {
      setError("Please complete the captcha");
      captchaRef.current?.execute();
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.username,
      password: form.password,
      options: {
        captchaToken,
      },
    });

    setLoading(false);
    if (error) {
      console.error("Login error:", error);
      setLoading(false);
      setError(error.message);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
      throw error;
    }
    captchaRef.current?.resetCaptcha();
    setCaptchaToken(null);
    handleSetPassword(form.password);
    return data;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6 container mx-auto flex items-center justify-center">
      <div className="bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-sm flex flex-col ">
        <h2 className="text-3xl text-center font-semibold mb-8">Login</h2>
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
        <div className="text-red-500 text-left items-start">{error}</div>
        <div className="self-center">
          <HCaptcha
            sitekey={hCaptchaSiteKey}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            ref={captchaRef}
          />
        </div>

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
