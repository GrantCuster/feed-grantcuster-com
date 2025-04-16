import { Providers } from "../shared/providers";
import "../styles.css";

import type { ReactNode } from "react";

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return <Providers>
    <>
      <link rel="icon" type="image/png" href="/images/sloth-favicon.png" />
    </>
    {children}
  </Providers>;
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
