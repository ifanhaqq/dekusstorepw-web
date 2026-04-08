import { createContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { supabase } from "../utils/supabase";
import { getPrivateKey, getPublicKey } from "../utils/crypto";

type KeyProviderProps = {
  children: React.ReactNode;
  password: string;
};

const KeyContext = createContext<{
  privateKey: CryptoKey | null;
  publicKey: CryptoKey | null;
}>({
  privateKey: null,
  publicKey: null,
});

export const KeyProvider = ({ children, password }: KeyProviderProps) => {
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);

  const { session } = AuthContext();

  if (!password) {
    console.log("Password is required to fetch keys.");
  }

  useEffect(() => {
    if (!session || !password) return;
    async function fetchPrivateKey() {
      const { data: keys, error } = await supabase.from("keys").select("*");

      if (keys) {
        const privateKey = await getPrivateKey(
          keys[0].encrypted_private_key,
          keys[0].iv,
          password,
          keys[0].salt,
        );
        const publicKey = await getPublicKey(keys[0].public_key);
        setPrivateKey(privateKey);
        setPublicKey(publicKey);
      }
      if (error) {
        console.error("Error fetching keys:", error);
      }
    }
    fetchPrivateKey();
  }, [session, password]);

  return (
    <KeyContext.Provider value={{ privateKey, publicKey }}>
      {children}
    </KeyContext.Provider>
  );
};
