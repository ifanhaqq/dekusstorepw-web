import { useState } from "react";
import LoadingGif from "../assets/loading.gif";
import { getPrivateKey } from "../utils/crypto";
import { supabase } from "../utils/supabase";

type Props = {
  handleSetPassword: (password: string) => void;
  handleSetLocked: (locked: boolean) => void;
};

export default function Unlock({ handleSetPassword, handleSetLocked }: Props) {
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const { data: keys, error } = await supabase.from("keys").select("*");

      if (error) {
        console.error("Error fetching keys:", error);
        setError("Failed to fetch keys, please try again.");
        setLoading(false);
        return;
      }

      await getPrivateKey(
        keys[0].encrypted_private_key,
        keys[0].iv,
        password,
        keys[0].salt,
      );

      handleSetPassword(password);
      handleSetLocked(false);
    } catch (err) {
      console.error("Error unlocking:", err);
      setError("Invalid password, please try again.");
      setLoading(false);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6 container mx-auto flex items-center justify-center">
      <div className="bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-sm flex flex-col ">
        <h2 className="text-xl text-center font-semibold mb-8">
          Page refreshed, please enter your password again!
        </h2>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full text-lg mb-4 p-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="text-red-500 text-left items-start">{error}</div>

        <button
          onClick={handleUnlock}
          className="mt-4 w-full bg-indigo-600 px-4 py-2 rounded-lg shadow hover:bg-indigo-500 transition text-lg font-medium"
        >
          Unlock
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
