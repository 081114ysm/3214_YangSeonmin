import nodemailer from "nodemailer";
import logger from "../config/logger.js";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER) {
    logger.warn("이메일 설정 없음 - 발송 건너뜀", { to, subject });
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"DevFocus" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info("이메일 발송 완료", { to, subject });
    return true;
  } catch (err) {
    logger.error("이메일 발송 실패", { to, subject, error: err.message });
    return false;
  }
};

export const sendWelcomeEmail = (to, nickname) =>
  sendEmail({
    to,
    subject: "[DevFocus] 가입을 환영합니다!",
    html: `<h2>안녕하세요, ${nickname}님!</h2>
           <p>DevFocus에 오신 것을 환영합니다. 지금 바로 강의를 시작해보세요.</p>
           <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">DevFocus 바로가기</a>`,
  });

export const sendEnrollmentEmail = (to, nickname, courseTitle) =>
  sendEmail({
    to,
    subject: `[DevFocus] "${courseTitle}" 수강 신청 완료`,
    html: `<h2>${nickname}님, 수강 신청이 완료되었습니다.</h2>
           <p>강의: <strong>${courseTitle}</strong></p>
           <p>지금 바로 학습을 시작해보세요!</p>`,
  });
