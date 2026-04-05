export const validateRegister = (req, res, next) => {
  const { email, password, nickname } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push("이메일을 입력해주세요");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("올바른 이메일 형식이 아닙니다");
  }

  if (!password) {
    errors.push("비밀번호를 입력해주세요");
  } else if (password.length < 4) {
    errors.push("비밀번호는 4자 이상이어야 합니다");
  }

  if (!nickname || !nickname.trim()) {
    errors.push("닉네임을 입력해주세요");
  } else if (nickname.trim().length < 2) {
    errors.push("닉네임은 2자 이상이어야 합니다");
  }

  if (errors.length > 0) return res.status(400).json({ error: errors[0], errors });
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push("이메일을 입력해주세요");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("올바른 이메일 형식이 아닙니다");
  }

  if (!password) {
    errors.push("비밀번호를 입력해주세요");
  }

  if (errors.length > 0) return res.status(400).json({ error: errors[0], errors });
  next();
};

export const validateQuestion = (req, res, next) => {
  const { title, content } = req.body;
  const errors = [];

  if (!title || !title.trim()) {
    errors.push("제목을 입력해주세요");
  } else if (title.trim().length < 2) {
    errors.push("제목은 2자 이상이어야 합니다");
  }

  if (!content || !content.trim()) {
    errors.push("내용을 입력해주세요");
  }

  if (errors.length > 0) return res.status(400).json({ error: errors[0], errors });
  next();
};

export const validateAnswer = (req, res, next) => {
  const { content, questionId } = req.body;
  const errors = [];

  if (!questionId) {
    errors.push("질문 ID가 필요합니다");
  }

  if (!content || !content.trim()) {
    errors.push("답변 내용을 입력해주세요");
  }

  if (errors.length > 0) return res.status(400).json({ error: errors[0], errors });
  next();
};

export const validateProgress = (req, res, next) => {
  const { lessonId, watchedSeconds } = req.body;
  const errors = [];

  if (!lessonId) {
    errors.push("강의 ID가 필요합니다");
  }

  if (watchedSeconds === undefined || watchedSeconds < 0) {
    errors.push("시청 시간이 올바르지 않습니다");
  }

  if (errors.length > 0) return res.status(400).json({ error: errors[0], errors });
  next();
};

export const validateNickname = (req, res, next) => {
  const { nickname } = req.body;

  if (!nickname || !nickname.trim()) {
    return res.status(400).json({ error: "닉네임을 입력해주세요" });
  }

  if (nickname.trim().length < 2) {
    return res.status(400).json({ error: "닉네임은 2자 이상이어야 합니다" });
  }

  next();
};
