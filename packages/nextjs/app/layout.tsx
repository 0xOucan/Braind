import type { Metadata } from "next";
import { ScaffoldStarkAppWithProviders } from "~~/components/ScaffoldStarkAppWithProviders";
import "~~/styles/globals.css";
import { ThemeProvider } from "~~/components/ThemeProvider";

export const metadata: Metadata = {
  title: "BrainD - Train your brain onchain!",
  description: "The ultimate retro pixel art brain training platform on Starknet. Challenge your mind with 6 unique games and earn $STARK rewards.",
  generator: "BrainD Platform",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: "/logo.ico",
};

const ScaffoldStarkApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider enableSystem>
          <ScaffoldStarkAppWithProviders>
            {children}
          </ScaffoldStarkAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldStarkApp;
