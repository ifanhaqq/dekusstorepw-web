import Login from "./pages/Login";
import { AuthContext } from "./context/AuthContext";
import Home from "./pages/Home";

export default function App() {
  const { session } = AuthContext();

  if (!session) {
    return <Login />;
  }

  return <Home />;
}
