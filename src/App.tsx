import { useState, useEffect } from "react";
import { supabase } from "./utils/supabase";
import type { Password } from "./const/types";

export default function App() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [items, setItems] = useState<Password[]>([
    {
      id: 1,
      platform: "Gmail",
      username: "ifan@gmail.com",
      password: "mypassword123",
      created_at: "2023-01-01T00:00:00Z",
    },
    {
      id: 2,
      platform: "Github",
      username: "ifanhanif",
      password: "secret456",
      created_at: "2023-01-02T00:00:00Z",
    },
    {
      id: 3,
      platform: "Github",
      username: "ifanhanif",
      password: "secret456",
      created_at: "2023-01-02T00:00:00Z",
    },
    {
      id: 4,
      platform: "Github",
      username: "ifanhanif",
      password: "secret456",
      created_at: "2023-01-02T00:00:00Z",
    },
    {
      id: 5,
      platform: "Github",
      username: "ifanhanif",
      password: "secret456",
      created_at: "2023-01-02T00:00:00Z",
    },
  ]);
  const [form, setForm] = useState({
    platform: "",
    username: "",
    password: "",
  });

  console.log(passwords);

  const [visible, setVisible] = useState<Record<number, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (!form.platform || !form.username || !form.password) return;

    const newItem: Password = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...form,
    };

    setItems((prev) => [...prev, newItem]);
    setForm({ platform: "", username: "", password: "" });
    setIsOpen(false);
  };

  const togglePassword = (id: number) => {
    setVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    async function getpasswords() {
      const { data: passwords } = await supabase.from("passwords").select("*");

      console.log(passwords);

      if (passwords) {
        setPasswords(passwords);
      }
    }

    getpasswords();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6 container mx-auto">
      <div className="min-h-screen bg-gray-950 text-gray-200 p-6 container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-wide">
            🔐 Password Manager
          </h1>

          <button
            onClick={() => setIsOpen(true)}
            className="bg-indigo-600 px-4 py-2 rounded-xl shadow hover:bg-indigo-500 transition"
          >
            + New
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-white">
                {item.platform}
              </h2>

              <p className="text-md text-gray-400">Username: {item.username}</p>

              <div className="flex items-center justify-between mt-2">
                <p className="text-md text-gray-300">
                  Password: {visible[item.id] ? item.password : "••••••••"}
                </p>

                <button
                  onClick={() => togglePassword(item.id)}
                  className="text-indigo-400 text-md hover:text-indigo-300 transition"
                >
                  {visible[item.id] ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {isOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Add New Password</h2>

              {/* Inputs */}
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Platform"
                  value={form.platform}
                  onChange={(e) =>
                    setForm({ ...form, platform: e.target.value })
                  }
                  className="bg-gray-800 p-2 rounded-lg outline-none"
                />

                <input
                  type="text"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="bg-gray-800 p-2 rounded-lg outline-none"
                />

                <input
                  type="text"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="bg-gray-800 p-2 rounded-lg outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAdd}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
