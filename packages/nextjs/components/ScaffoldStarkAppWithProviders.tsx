"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import { StarknetConfig, starkscan } from "@starknet-react/core";
import { Header } from "~~/components/Header";

import { appChains, connectors } from "~~/services/web3/connectors";
import provider from "~~/services/web3/provider";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-stark/useNativeCurrencyPrice";

const Footer = dynamic(
  () => import("~~/components/Footer").then((mod) => mod.Footer),
  {
    ssr: false,
  },
);

const ScaffoldStarkApp = ({ children }: { children: React.ReactNode }) => {
  useNativeCurrencyPrice();

  return (
    <>
      <div className="flex relative flex-col min-h-screen bg-main" data-theme="pixel-dark">
        {/* Pixel art background effects */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23dc2626' fillOpacity='0.1'%3E%3Crect x='0' y='0' width='8' height='8'/%3E%3Crect x='16' y='16' width='8' height='8'/%3E%3Crect x='32' y='32' width='8' height='8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Scanlines effect */}
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full scanlines" />
        </div>

        <Header />
        <main className="relative flex flex-col flex-1 z-10">{children}</main>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "game-card border-accent",
          style: {
            background: 'var(--pixel-bg-card)',
            color: 'var(--pixel-white)',
            border: '2px solid var(--pixel-yellow)',
            fontFamily: '"Orbitron", monospace',
            fontSize: '14px',
          },
        }}
      />
    </>
  );
};

export const ScaffoldStarkAppWithProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <StarknetConfig
      chains={appChains}
      provider={provider}
      connectors={connectors}
      explorer={starkscan}
    >
      <ScaffoldStarkApp>{children}</ScaffoldStarkApp>
    </StarknetConfig>
  );
};
