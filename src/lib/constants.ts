
// numbers
export const MEMES_PAGE_SIZE = 10;
export const PROFILE_PAGE_SIZE = 60;
export const SEARCH_PAGE_SIZE = 5;
export const COMMENT_PAGE_SIZE = 6;
export const LATEST_TXS_MEMES_COUNT = 5;
export const LEADERBOARD_PAGE_SIZE = 10;
export const MAX_COMMENT_LENGTH = 140;

// regex
export const telegramRegex =
  /^(?:https?:\/\/)?(?:www\.)?t\.me\/[a-zA-Z0-9_-]+$/;
export const twitterOrXRegex =
  /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_-]+$/;
export const discordRegex =
  /https?:\/\/(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[^\s/]+/;

// others
export const LABELS = {
  "change-wallet": "Change wallet",
  connecting: "Connecting ...",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect Wallet",
  "no-wallet": "Connect Wallet",
} as const;
