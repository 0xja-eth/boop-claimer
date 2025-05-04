"use client";

import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BaseWalletConnectionButton } from "./base-wallet-connection-button";
import type { ButtonProps } from "./button";
import { useWalletModal } from "./use-wallet-modal";
import Link from "next/link";

type Props = ButtonProps & {
  labels: Omit<
    {
      [TButtonState in ReturnType<
        typeof useWalletMultiButton
      >["buttonState"]]: string;
    },
    "connected" | "disconnecting"
  > & {
    "copy-address": string;
    copied: string;
    "change-wallet": string;
    disconnect: string;
  };
};

export function BaseWalletMultiButton({ children, labels, ...props }: Props) {
  const { setVisible: setModalVisible } = useWalletModal();
  const {
    buttonState,
    onConnect,
    onDisconnect,
    publicKey,
    walletIcon,
    walletName,
  } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });
  // const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;

      // Do nothing if clicking dropdown or its descendants
      if (!node || node.contains(event.target as Node)) return;

      setMenuOpen(false);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);
  const content = useMemo(() => {
    if (children) {
      return children;
    } else if (publicKey) {
      const base58 = publicKey.toBase58();
      return base58.slice(0, 6) + ".." + base58.slice(-4);
    } else if (buttonState === "connecting" || buttonState === "has-wallet") {
      return labels[buttonState];
    } else {
      return labels["no-wallet"];
    }
  }, [buttonState, children, labels, publicKey]);
  return (
    <div className="wallet-adapter-dropdown">
      <BaseWalletConnectionButton
        {...props}
        aria-expanded={menuOpen}
        style={{
          pointerEvents: menuOpen ? "none" : "auto",
          ...props.style,
        }}
        onClick={() => {
          switch (buttonState) {
            case "no-wallet":
              setModalVisible(true);
              break;
            case "has-wallet":
              if (onConnect) {
                onConnect();
              }
              break;
            case "connected":
              setMenuOpen(true);
              break;
          }
        }}
        walletIcon={walletIcon}
        walletName={walletName}
      >
        {content}
      </BaseWalletConnectionButton>
      <ul
        aria-label="dropdown-list"
        className={`wallet-adapter-dropdown-list w-full rounded-md bg-background-500 p-2 font-normal ${menuOpen && "wallet-adapter-dropdown-list-active"}`}
        ref={ref}
        role="menu"
      >
        {/* {publicKey ? (
          <li
            className="h-12 cursor-pointer rounded text-center text-sm font-medium transition duration-100 hover:bg-background-100"
            role="menuitem"
          >
            <Link
              className="inline-flex h-full w-full items-center justify-center"
              href={`/profile/${publicKey}`}
            >
              View Profile
            </Link>
          </li>
        ) : (
          <li></li>
        )} */}
        {onDisconnect ? (
          <li
            suppressHydrationWarning
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded text-center text-sm font-medium transition duration-100 hover:bg-background-100"
            onClick={() => {
              onDisconnect();
              setMenuOpen(false);
            }}
            role="menuitem"
          >
            {labels["disconnect"]}
          </li>
        ) : (
          <li></li>
        )}
      </ul>
    </div>
  );
}
