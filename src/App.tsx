import Login from "./pages/Login";
import { AuthContext } from "./context/AuthContext";
import { KeyProvider } from "./context/KeyContext";
import Home from "./pages/Home";
import { useState } from "react";

export default function App() {
  const [password, setPassword] = useState<string>("");
  const { session } = AuthContext();

  const handleSetPassword = (password: string) => {
    setPassword(password);
  };

  if (!session) {
    return <Login handleSetPassword={handleSetPassword} />;
  }

  return (
    <KeyProvider password={password}>
      <Home />
    </KeyProvider>
  );
}
