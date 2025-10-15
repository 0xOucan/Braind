"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { Brain, Trophy, Gamepad2, Zap, User, Target } from "lucide-react";
import { useOutsideClick } from "~~/hooks/scaffold-stark";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";
import { useTheme } from "next-themes";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { devnet } from "@starknet-react/chains";
import { SwitchTheme } from "./SwitchTheme";
import { useAccount, useNetwork, useProvider } from "@starknet-react/core";
import { BlockIdentifier } from "starknet";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <Brain className="h-4 w-4" />,
  },
  {
    label: "Games",
    href: "/games",
    icon: <Gamepad2 className="h-4 w-4" />,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    label: "Predictions",
    href: "/prediction-market",
    icon: <Target className="h-4 w-4" />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    label: "Debug",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);
  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href} className={isMobile ? "w-full mb-2" : ""}>
            <Link
              href={href}
              passHref
              className={`pixel-font text-sm flex items-center gap-2 px-4 py-3 border-2 transition-all duration-200 ${
                isMobile ? "w-full justify-start" : ""
              } ${
                isActive
                  ? "border-yellow-400 bg-yellow-400 text-black shadow-[2px_2px_0_var(--pixel-black)]"
                  : isMobile
                    ? "border-gray-700 bg-gray-800 text-white hover:border-red-600 hover:bg-red-600 hover:shadow-[2px_2px_0_var(--pixel-black)]"
                    : "border-transparent text-gray-900 hover:border-red-600 hover:bg-red-600 hover:text-white hover:shadow-[2px_2px_0_var(--pixel-black)]"
              }`}
              style={{ textDecoration: 'none', fontWeight: 600 }}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.network === devnet.network;

  const { provider } = useProvider();
  const { address, status, chainId } = useAccount();
  const { chain } = useNetwork();
  const [isDeployed, setIsDeployed] = useState(true);

  useEffect(() => {
    if (
      status === "connected" &&
      address &&
      chainId === targetNetwork.id &&
      chain.network === targetNetwork.network
    ) {
      provider
        .getClassHashAt(address)
        .then((classHash) => {
          if (classHash) setIsDeployed(true);
          else setIsDeployed(false);
        })
        .catch((e) => {
          console.error("contract check", e);
          if (e.toString().includes("Contract not found")) {
            setIsDeployed(false);
          }
        });
    }
  }, [
    status,
    address,
    provider,
    chainId,
    targetNetwork.id,
    targetNetwork.network,
    chain.network,
  ]);

  return (
    <div className="header-pixel lg:static top-0 navbar min-h-0 shrink-0 justify-between z-20 px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2 -mr-2">
        <div className="lg:hidden relative" ref={burgerMenuRef}>
          <button
            tabIndex={0}
            className={`ml-2 btn btn-sm border-2 transition-all duration-200 cursor-pointer
              ${isDrawerOpen
                ? "bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-500"
                : "bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700"
              }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Hamburger clicked, current state:', isDrawerOpen);
              setIsDrawerOpen((prevIsOpenState) => {
                console.log('Setting drawer to:', !prevIsOpenState);
                return !prevIsOpenState;
              });
            }}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          {isDrawerOpen && (
            <div className="fixed top-16 left-0 right-0 z-[100] px-4">
              <ul
                tabIndex={0}
                className="menu menu-compact p-4 shadow-2xl rounded-lg w-full max-w-xs bg-black border-4 border-red-600"
                onClick={() => {
                  setIsDrawerOpen(false);
                }}
              >
                <HeaderMenuLinks isMobile={true} />
              </ul>
            </div>
          )}
        </div>
        {/* Logo - Desktop */}
        <Link
          href="/"
          passHref
          className="hidden lg:flex items-center gap-3 ml-4 mr-6 shrink-0"
        >
          <div className="relative w-14 h-14 animate-pixel-float">
            <Image
              alt="BrainD logo"
              className="cursor-pointer"
              fill
              src="/logo.svg"
            />
          </div>
          <div className="flex flex-col">
            <span className="pixel-font text-2xl neon-text-red leading-tight">BrainD</span>
            <span className="retro-font text-sm neon-text-yellow font-semibold">Train onchain!</span>
          </div>
        </Link>
        {/* Logo - Mobile (compact) */}
        <Link
          href="/"
          passHref
          className="flex lg:hidden items-center gap-2 ml-2 shrink-0"
        >
          <div className="relative w-10 h-10 animate-pixel-float">
            <Image
              alt="BrainD logo"
              className="cursor-pointer"
              fill
              src="/logo.svg"
            />
          </div>
          <span className="pixel-font text-lg neon-text-red">BrainD</span>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-2 gap-4">
        {status === "connected" && !isDeployed ? (
          <span className="bg-[#8a45fc] text-[9px] p-1 text-white">
            Wallet Not Deployed
          </span>
        ) : null}
        <CustomConnectButton />
        {/* <FaucetButton /> */}
        <SwitchTheme
          className={`pointer-events-auto ${
            isLocalNetwork ? "mb-1 lg:mb-0" : ""
          }`}
        />
      </div>
    </div>
  );
};
