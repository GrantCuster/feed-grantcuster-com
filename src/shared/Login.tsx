"use client";

import { useAtom } from "jotai";
import { adminPasswordAtom } from "./atoms";
import { useState } from "react";

function Login({
  tryLogin,
}: {
  tryLogin: (adminPassword: string) => Promise<boolean>;
}) {
  const [, setAdminPassword] = useAtom(adminPasswordAtom);
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col mx-auto max-w-[600px] w-full h-full my-3 gap-2">
      <div>Login</div>
      <div>
        <input
          type="password"
          className="bg-hard-black text-sm green w-full px-3 py-2 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              const result = await tryLogin(password);
              if (result) {
                setAdminPassword(password);
                window.location.href = "/";
              } else {
                alert("Wrong password");
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default Login;
