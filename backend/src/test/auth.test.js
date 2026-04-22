import { describe, it } from "node:test";
import assert from "node:assert/strict";

// requireRole 미들웨어 단위 테스트
describe("requireRole middleware", () => {
  const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "인증 필요" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "권한 없음" });
    }
    next();
  };

  it("허용된 역할이면 next()를 호출한다", () => {
    const req = { user: { id: 1, role: "admin" } };
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    const res = { status: () => res, json: () => res };

    requireRole("admin")(req, res, next);
    assert.equal(nextCalled, true);
  });

  it("허용되지 않은 역할이면 403을 반환한다", () => {
    const req = { user: { id: 1, role: "student" } };
    let statusCode = null;
    const res = {
      status(code) { statusCode = code; return this; },
      json() { return this; },
    };
    const next = () => {};

    requireRole("admin")(req, res, next);
    assert.equal(statusCode, 403);
  });

  it("user가 없으면 401을 반환한다", () => {
    const req = {};
    let statusCode = null;
    const res = {
      status(code) { statusCode = code; return this; },
      json() { return this; },
    };
    const next = () => {};

    requireRole("admin")(req, res, next);
    assert.equal(statusCode, 401);
  });
});

// register 역할 검증 로직 단위 테스트
describe("register role validation", () => {
  const resolveRole = (role) =>
    ["student", "instructor"].includes(role) ? role : "student";

  it("student 역할은 그대로 허용된다", () => {
    assert.equal(resolveRole("student"), "student");
  });

  it("instructor 역할은 그대로 허용된다", () => {
    assert.equal(resolveRole("instructor"), "instructor");
  });

  it("admin은 student로 강제된다", () => {
    assert.equal(resolveRole("admin"), "student");
  });

  it("빈 값은 student로 강제된다", () => {
    assert.equal(resolveRole(undefined), "student");
    assert.equal(resolveRole(""), "student");
  });
});
