import { createContext } from "react";

const KeyContext = createContext<{
  privateKey: CryptoKey | null;
  publicKey: CryptoKey | null;
}>({
  privateKey: null,
  publicKey: null,
});

export default KeyContext;
