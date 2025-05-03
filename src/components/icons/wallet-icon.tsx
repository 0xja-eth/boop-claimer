import { TIcon } from "@/lib/types";

export default function WalletIcon({
  width = 24,
  height = 24,
  className = "fill-white",
}: TIcon) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 23 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16.9999 2.75H2.33325V19.25H18.8333V15.5833H20.6666V6.41667H18.8333V2.75H16.9999ZM16.9999 15.5833V17.4167H4.16659V4.58333H16.9999V6.41667H9.66658V15.5833H16.9999ZM18.8333 13.75H11.4999V8.25H18.8333V13.75ZM15.1666 10.0833H13.3333V11.9167H15.1666V10.0833Z" />
    </svg>
  );
}
