import logger from "../config/logger.js";

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

export const sendDiscord = async (content) => {
  if (!WEBHOOK_URL) {
    logger.warn("Discord 웹훅 URL 없음 - 건너뜀");
    return false;
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    logger.info("Discord 알림 전송 완료");
    return true;
  } catch (err) {
    logger.error("Discord 알림 실패", { error: err.message });
    return false;
  }
};

export const sendDiscordEmbed = async (title, description, color = 0xff385c) => {
  if (!WEBHOOK_URL) return false;

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{ title, description, color, timestamp: new Date().toISOString() }],
      }),
    });
    return res.ok;
  } catch (err) {
    logger.error("Discord embed 실패", { error: err.message });
    return false;
  }
};
