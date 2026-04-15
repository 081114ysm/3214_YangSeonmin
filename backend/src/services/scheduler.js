import cron from "node-cron";
import db from "../config/db.js";
import logger from "../config/logger.js";
import { sendDiscordEmbed } from "./discord.js";

export const startScheduler = () => {
  // 매일 오전 9시 - 일별 통계 Discord 전송
  cron.schedule("0 9 * * *", async () => {
    logger.info("[Scheduler] 일별 통계 작업 시작");
    try {
      const [[{ newUsers }]] = await db.query(
        "SELECT COUNT(*) as newUsers FROM users WHERE DATE(created_at) = CURDATE()"
      );
      const [[{ newEnrolls }]] = await db.query(
        "SELECT COUNT(*) as newEnrolls FROM enrollments WHERE DATE(enrolled_at) = CURDATE()"
      );
      const [[{ focusCount }]] = await db.query(
        "SELECT COUNT(*) as focusCount FROM focus_sessions WHERE DATE(created_at) = CURDATE()"
      );

      await sendDiscordEmbed(
        "DevFocus 일별 통계",
        `신규 가입자: ${newUsers}명\n신규 수강 신청: ${newEnrolls}건\n집중 세션: ${focusCount}건`,
        0x00b0f4
      );
      await logJob("daily_stats", "completed", `신규유저:${newUsers}, 수강:${newEnrolls}`);
    } catch (err) {
      logger.error("[Scheduler] 일별 통계 실패", { error: err.message });
      await logJob("daily_stats", "failed", err.message);
    }
  });

  // 매주 월요일 오전 3시 - 90일 이상 된 집중 세션 정리
  cron.schedule("0 3 * * 1", async () => {
    logger.info("[Scheduler] 오래된 집중세션 정리 시작");
    try {
      const [result] = await db.query(
        "DELETE FROM focus_sessions WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)"
      );
      await logJob("cleanup_focus", "completed", `삭제된 세션: ${result.affectedRows}건`);
      logger.info("[Scheduler] 집중세션 정리 완료", { deleted: result.affectedRows });
    } catch (err) {
      logger.error("[Scheduler] 집중세션 정리 실패", { error: err.message });
      await logJob("cleanup_focus", "failed", err.message);
    }
  });

  // 매시간 - 결제 pending 상태 30분 이상 방치 시 failed 처리
  cron.schedule("0 * * * *", async () => {
    try {
      await db.query(
        "UPDATE payments SET status='failed' WHERE status='pending' AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)"
      );
    } catch (err) {
      logger.error("[Scheduler] 결제 만료 처리 실패", { error: err.message });
    }
  });

  logger.info("스케줄러 시작됨");
};

const logJob = async (jobName, status, message) => {
  try {
    await db.query(
      "INSERT INTO job_logs (job_name, status, message, finished_at) VALUES (?, ?, ?, NOW())",
      [jobName, status, message]
    );
  } catch {}
};
