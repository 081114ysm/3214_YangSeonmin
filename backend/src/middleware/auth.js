import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devfocus_secret_key";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "토큰 없음" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "토큰 오류" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "인증 필요" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "권한 없음" });
  }
  next();
};

export { JWT_SECRET };
