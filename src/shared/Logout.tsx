"use client";

import { useAtom } from "jotai";
import { adminPasswordAtom } from "./atoms";
import { useEffect } from "react";

function Logout() {
  const [, setAdminPassword] = useAtom(adminPasswordAtom);

  useEffect(() => {
    setAdminPassword(null);
    window.location.href = "/";
  }, []);

  return null;
}

export default Logout;
