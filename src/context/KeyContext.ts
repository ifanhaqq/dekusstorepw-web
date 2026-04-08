import { createContext } from "react";

const KeyContext = createContext<{
  privateKey: CryptoKey | null;
  publicKey: CryptoKey | null;
  password: string | null;
}>({
  privateKey: null,
  publicKey: null,
  password: null,
});

export default KeyContext;
