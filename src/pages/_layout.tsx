import { Providers } from "../shared/providers";
import "../styles.css";

import type { ReactNode } from "react";

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return <Providers>{children}</Providers>;
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
