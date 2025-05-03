import type { WalletName } from "@solana/wallet-adapter-base";
import React from "react";
import { Button } from "./button";
import WalletIcon from "../icons/wallet-icon";

type Props = React.ComponentProps<typeof Button> & {
  walletIcon?: string;
  walletName?: WalletName;
};

export function BaseWalletConnectionButton({ ...props }: Props) {
  return (
    <Button
      {...props}
      className="wallet-adapter-button-trigger"
      startIcon={<WalletIcon />}
    />
  );
}
