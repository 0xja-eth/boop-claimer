"use client";

import { LABELS } from "@/lib/constants";
import { BaseWalletMultiButton } from "@/components/wallet/base-wallet-multi-button";

export default function WalletBtn() {
  return (
    <div className="bg-background-500 flex rounded">
      <BaseWalletMultiButton
        style={{
          backgroundColor: "transparent",
          fontFamily: "inherit",
          height: "auto",
          lineHeight: "0",
          fontWeight: 400,
        }}
        labels={LABELS}
      />
    </div>
  );
}
