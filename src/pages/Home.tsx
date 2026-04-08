import { useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabase";
import type { Password, PasswordInput } from "../const/types";
import { Check, SquarePen, Trash } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingGif from "../assets/loading.gif";
import KeyContext from "../context/KeyContext";
import { encryptPassword, decryptPassword } from "../utils/crypto";

export default function Home() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [chromeFuckingType, setChromeFuckingType] = useState<
    "text" | "password"
  >("text");

  const [form, setForm] = useState({
    platform: "",
    username: "",
    password: "",
  });

  const keyPair = useContext(KeyContext);

  const [isMobile, setIsMobile] = useState(false);

  if (!keyPair) {
    throw new Error("KeyContext is not available");
  }

  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<{
    type: string;
    message: string;
  } | null>(null);

  const [isOpen, setIsOpen] = useState<{
    open: boolean;
    type: string;
    id: number | null;
  }>({
    open: false,
    type: "",
    id: null,
  });
  const [copied, setCopied] = useState<{ id: number; copied: boolean }>({
    id: -1,
    copied: false,
  });

  const handleAdd = async () => {
    if (!form.platform || !form.username || !form.password) return;
    setLoading(true);

    const encryptedPassword = await encryptPassword(
      form.password,
      keyPair.publicKey!,
    );

    const passwordData: PasswordInput = {
      platform: form.platform,
      username: form.username,
      encrypted_password: encryptedPassword.encryptedPassword,
      encrypted_key: encryptedPassword.encryptedKey,
      iv_password: encryptedPassword.ivPassword,
    };

    const { data, error } = await supabase
      .from("passwords")
      .insert([passwordData])
      .select();

    if (error) throw error;

    const decryptedPassword = await decryptPassword(
      keyPair.privateKey!,
      data![0].encrypted_key,
      data![0].iv_password,
      data![0].encrypted_password,
    );

    setForm({ platform: "", username: "", password: "" });
    setPasswords((prev) => [
      ...prev,
      { ...data![0], password: decryptedPassword },
    ]);
    setIsOpen({ open: false, type: "", id: null });
    setLoading(false);
    handleSetWarning("success", "Password added successfully!");
  };

  const handleCopy = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ id, copied: true });

      setTimeout(() => setCopied({ id: -1, copied: false }), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCloseModal = () => {
    setIsOpen({ open: false, type: "", id: null });
    setForm({ platform: "", username: "", password: "" });
    blurFuckingType();
  };

  const blurFuckingType = () => {
    setTimeout(() => {
      setChromeFuckingType("text");
    }, 100);
  };

  const handleSetWarning = (type: string, message: string) => {
    setWarning({ type, message });
    setTimeout(() => setWarning(null), 3000);
  };

  const handleEdit = async (id: number) => {
    setChromeFuckingType("password");
    setLoading(true);
    const { data: datas, error } = await supabase
      .from("passwords")
      .select()
      .eq("id", id);

    if (error) throw error;

    const passwords = datas as unknown as Password[];

    setForm({
      platform: passwords![0].platform,
      username: passwords![0].username,
      password: passwords![0].password,
    });

    setIsOpen({ open: true, type: "edit", id });
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!form.platform || !form.username || !form.password) return;
    setLoading(true);
    const encryptedPassword = await encryptPassword(
      form.password,
      keyPair.publicKey!,
    );

    const updatedPassword: PasswordInput = {
      platform: form.platform,
      username: form.username,
      encrypted_password: encryptedPassword.encryptedPassword,
      encrypted_key: encryptedPassword.encryptedKey,
      iv_password: encryptedPassword.ivPassword,
    };

    const { error } = await supabase
      .from("passwords")
      .update(updatedPassword)
      .eq("id", isOpen.id);
    if (error) {
      handleSetWarning("error", "Failed to update password, please try again.");
      throw error;
    }
    handleCloseModal();
    setLoading(false);

    setPasswords((prev) =>
      prev.map((password) =>
        password.id === isOpen.id ? { ...password, ...form } : password,
      ),
    );
    handleSetWarning("success", "Password updated successfully!");
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    const { error } = await supabase.from("passwords").delete().eq("id", id);
    if (error) {
      handleSetWarning("error", "Failed to delete password, please try again.");
      throw error;
    } else {
      setPasswords((prev) => prev.filter((password) => password.id !== id));
    }
    setLoading(false);
    handleCloseModal();
    handleSetWarning("success", "Password deleted successfully!");
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  useEffect(() => {
    async function getpasswords() {
      setLoading(true);
      const { data: passwords } = await supabase.from("passwords").select("*");

      if (passwords) {
        passwords.map(async (password) => {
          const decryptedPassword = await decryptPassword(
            keyPair.privateKey!,
            password.encrypted_key,
            password.iv_password,
            password.encrypted_password,
          );
          password.password = decryptedPassword;
        });

        setPasswords(passwords);
      }
      setLoading(false);
    }

    getpasswords();
  }, [keyPair]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 mx-auto container">
      <AnimatePresence>
        {warning && (
          <motion.div
            key={"box"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className={`fixed bottom-4 right-4 ${warning.type === "error" ? "bg-red-500" : warning.type === "warning" ? "bg-yellow-500" : "bg-green-500"} text-white p-4 rounded-xl shadow-md`}
            // className={`fixed bottom-10 right-10 bg-green-500 text-white p-4 rounded-xl shadow-md`}
          >
            <p>{warning.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={`min-h-screen bg-gray-950 text-gray-200 ${isMobile ? "p-4" : "p-12"} container mx-auto flex flex-col`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center ${isMobile ? "mt-4 px-4 mb-4" : "mb-6 "}`}
        >
          <h1
            className={`${isMobile ? "text-xl" : "text-2xl"} font-bold tracking-wide`}
          >
            🔐 Password Manager
          </h1>

          <button
            onClick={() => setIsOpen({ open: true, type: "add", id: null })}
            className="bg-indigo-600 px-4 py-2 rounded-xl shadow hover:bg-indigo-500 transition"
          >
            + New
          </button>
        </div>

        {/* Cards */}
        <div
          className={`grid grid-cols-1 ${isMobile ? "gap-2 max-h-[77vh]" : "md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[72vh]"} overflow-auto mt-6 no-scrollbar`}
        >
          {passwords.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <div className="flex mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {item.platform}
                  </h2>

                  <p className="text-md text-gray-400">
                    Username: {item.username}
                  </p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="text-white-400 bg-yellow-600 rounded-lg p-2 text-sm hover:bg-yellow-700 transition"
                  >
                    <SquarePen className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() =>
                    setIsOpen({
                      open: true,
                      type: "confirm-delete",
                      id: item.id,
                    })
                  }
                  className="text-white-400 bg-red-600 rounded-lg p-2 text-sm hover:bg-red-700 transition"
                >
                  <Trash className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleCopy(item.id, item.password)}
                  className="text-white-400 bg-indigo-600 rounded-lg p-2 text-sm hover:text-indigo hover:bg-indigo-300 transition"
                >
                  {copied.id === item.id && copied.copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    "Copy Password"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className={`flex ${isMobile ? "my-auto" : "mt-auto"} `}>
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded-lg shadow hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div>
      </div>
      {isOpen.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          {(isOpen.type === "add" || isOpen.type === "edit") && (
            <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">
                {isOpen.type === "add" ? "Add New Password" : "Edit Password"}
              </h2>

              {/* Inputs */}
              <form autoComplete="off">
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
                    autoComplete="123"
                    name="usn"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="bg-gray-800 p-2 rounded-lg outline-none"
                  />

                  <input
                    type={chromeFuckingType}
                    placeholder="Password"
                    autoComplete="p321w"
                    onFocus={() => setChromeFuckingType("password")}
                    name="pw"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="bg-gray-800 p-2 rounded-lg outline-none"
                  />
                </div>
              </form>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => handleCloseModal()}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={isOpen.type === "add" ? handleAdd : handleUpdate}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
                >
                  {isOpen.type === "add" ? "Add" : "Update"}
                </button>
              </div>
            </div>
          )}

          {isOpen.type === "confirm-delete" && (
            <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">
                Are you sure you want to delete this password?
              </h2>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleCloseModal()}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(isOpen.id!)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
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
