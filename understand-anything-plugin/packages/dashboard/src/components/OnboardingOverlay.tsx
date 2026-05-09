import { useState, useEffect } from "react";

/**
 * First-visit onboarding overlay.
 *
 * Renders 5 dismissible steps that teach a new user how to operate the dashboard.
 * State persists in localStorage so returning users are not interrupted.
 *
 * Force-show via `?onboard=force` URL param (useful for screenshots / demos).
 */

const STORAGE_KEY = "ua-onboarding-dismissed-v1";

interface Step {
  title: string;
  body: string;
  hint?: string;
}

const STEPS: Step[] = [
  {
    title: "欢迎进入知识图",
    body: "你看到的圆点和连线是 Understand-Anything 把这份项目（代码 / wiki）抽出来的实体和关系。每个节点是一个文件、概念、实体或断言。",
    hint: "5 步以内带你过完核心操作",
  },
  {
    title: "顶部三个视图",
    body: "Overview 看全貌（力导向图）· Learn 跟随预设学习路径 · Deep Dive 看类型 / 复杂度统计。每个视图回答一种不同的问法。",
    hint: "切视图前先想清楚自己在问什么",
  },
  {
    title: "搜索 + 点节点",
    body: "顶部搜索框模糊匹配节点名 / summary / tags。点任意节点 → 右侧详情面板出现 summary + 邻居列表 + Open Article 按钮。",
    hint: "搜索高亮居中，点节点高亮邻居边",
  },
  {
    title: "Layer 切换 + Tour",
    body: "顶部 All 旁边的 layer 标签按 index.md 分类只显示部分节点。右侧 Project Tour 自动按编辑者预设顺序导览。",
    hint: "节点太密看不清就用 Layer，没头绪就启 Tour",
  },
  {
    title: "更多隐藏功能",
    body: "顶栏还有 Filter（按类型 / 复杂度过滤）、Export（导出图）、Path（找两个节点之间的路径）、Theme（切换主题）。Shift + ? 看完整快捷键。",
    hint: "需要时再展开，不要一次记完",
  },
];

export default function OnboardingOverlay() {
  const [stepIdx, setStepIdx] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const force = params.get("onboard") === "force";
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    if (force || !dismissed) setOpen(true);
  }, []);

  if (!open) return null;

  const isFirst = stepIdx === 0;
  const isLast = stepIdx === STEPS.length - 1;
  const step = STEPS[stepIdx];

  function dismiss(remember: boolean) {
    if (remember && typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  }

  return (
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss(false);
      }}
    >
      <div style={cardStyle}>
        <div style={tagStyle}>
          <span style={numStyle}>0{stepIdx + 1}</span>
          <span> / 0{STEPS.length}</span>
          <span style={dotStyle} />
          <span>UNDERSTAND-ANYTHING · 入门</span>
        </div>

        <h2 style={titleStyle}>{step.title}</h2>
        <p style={bodyStyle}>{step.body}</p>
        {step.hint && (
          <blockquote style={hintStyle}>
            <span style={{ color: "#c8a882", marginRight: 8 }}>·</span>
            {step.hint}
          </blockquote>
        )}

        <div style={progressTrackStyle}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                ...dotProgressStyle,
                background: i === stepIdx ? "#c8a882" : "#444",
                width: i === stepIdx ? 28 : 6,
              }}
            />
          ))}
        </div>

        <div style={btnRowStyle}>
          <button
            type="button"
            onClick={() => dismiss(true)}
            style={{ ...btnStyle, ...btnGhostStyle }}
          >
            不再显示
          </button>
          <div style={{ flex: 1 }} />
          {!isFirst && (
            <button
              type="button"
              onClick={() => setStepIdx(stepIdx - 1)}
              style={{ ...btnStyle, ...btnGhostStyle }}
            >
              上一步
            </button>
          )}
          {!isLast ? (
            <button
              type="button"
              onClick={() => setStepIdx(stepIdx + 1)}
              style={{ ...btnStyle, ...btnPrimaryStyle }}
            >
              下一步
            </button>
          ) : (
            <button
              type="button"
              onClick={() => dismiss(true)}
              style={{ ...btnStyle, ...btnPrimaryStyle }}
            >
              开始探索
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- styles (inline 避免依赖 css 文件) -----

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.78)",
  backdropFilter: "blur(6px)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  fontFamily:
    '"Noto Sans SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif',
  animation: "ua-fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
};

const cardStyle: React.CSSProperties = {
  background: "#1a1a1a",
  color: "#fafafa",
  maxWidth: 580,
  width: "100%",
  padding: "48px 48px 36px",
  border: "1px solid #2a2a2a",
  borderTop: "2px solid #c8a882",
  position: "relative",
};

const tagStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  letterSpacing: "0.3em",
  color: "#888",
  textTransform: "uppercase",
  marginBottom: 24,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 4,
};

const numStyle: React.CSSProperties = {
  fontFamily: '"Noto Serif SC", Georgia, serif',
  color: "#c8a882",
  fontSize: "0.9rem",
  letterSpacing: "0.1em",
  marginRight: 4,
};

const dotStyle: React.CSSProperties = {
  width: 4,
  height: 4,
  background: "#c8a882",
  borderRadius: "50%",
  margin: "0 12px",
};

const titleStyle: React.CSSProperties = {
  fontFamily: '"Noto Serif SC", Georgia, serif',
  fontSize: "1.7rem",
  fontWeight: 400,
  letterSpacing: "0.02em",
  lineHeight: 1.3,
  marginBottom: 16,
  color: "#fafafa",
};

const bodyStyle: React.CSSProperties = {
  fontSize: "0.98rem",
  lineHeight: 1.7,
  color: "#bbb",
  marginBottom: 0,
};

const hintStyle: React.CSSProperties = {
  margin: "20px 0 0",
  padding: "12px 18px",
  borderLeft: "2px solid #5a4a3a",
  background: "rgba(200, 168, 130, 0.06)",
  fontSize: "0.86rem",
  color: "#c8a882",
  fontStyle: "italic",
};

const progressTrackStyle: React.CSSProperties = {
  display: "flex",
  gap: 6,
  marginTop: 36,
  marginBottom: 28,
};

const dotProgressStyle: React.CSSProperties = {
  height: 4,
  borderRadius: 2,
  transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s",
};

const btnRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const btnStyle: React.CSSProperties = {
  padding: "10px 22px",
  fontSize: "0.82rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  border: "1px solid",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
  fontWeight: 400,
};

const btnGhostStyle: React.CSSProperties = {
  background: "transparent",
  borderColor: "#444",
  color: "#888",
};

const btnPrimaryStyle: React.CSSProperties = {
  background: "#c8a882",
  borderColor: "#c8a882",
  color: "#1a1a1a",
  fontWeight: 500,
};
