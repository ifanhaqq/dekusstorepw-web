import Login from "./pages/Login";
import { AuthContext } from "./context/AuthContext";
import { KeyProvider } from "./context/KeyProvider";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import Unlock from "./pages/Unlock";

export default function App() {
  const [password, setPassword] = useState<string>("");

  const [locked, setLocked] = useState(false);

  const { session } = AuthContext();

  const handleSetPassword = (password: string) => {
    setPassword(password);
  };

  const handleSetLocked = (locked: boolean) => {
    setLocked(locked);
  };

  useEffect(() => {
    if (!password) {
      setLocked(true);
    }
  }, [password]);

  if (!session) {
    return <Login handleSetPassword={handleSetPassword} />;
  }

  if (!password || locked) {
    return (
      <Unlock
        handleSetPassword={handleSetPassword}
        handleSetLocked={handleSetLocked}
      />
    );
  }

  return (
    <KeyProvider password={password}>
      <Home />
    </KeyProvider>
  );
}
