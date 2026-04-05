import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import type { Session } from "@supabase/supabase-js";

export const AuthContext = () => {
  const [session, setSession] = useState<null | Session>(null);

  useEffect(() => {
    // get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // listen to changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session };
};
