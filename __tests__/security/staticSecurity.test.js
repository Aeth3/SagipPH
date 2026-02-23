import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SOURCE_DIRS = ["package/src", "package/components", "App.tsx", "package/Main.js"];
const EXCLUDED_SEGMENTS = ["node_modules", "__tests__", "__mocks__", "android", "ios"];

function isSourceFile(filePath) {
  return [".js", ".jsx", ".ts", ".tsx"].includes(path.extname(filePath));
}

function shouldSkip(filePath) {
  return EXCLUDED_SEGMENTS.some((segment) => filePath.includes(segment));
}

function listFiles(entryPath) {
  const fullPath = path.join(ROOT, entryPath);
  if (!fs.existsSync(fullPath)) return [];

  const stat = fs.statSync(fullPath);
  if (stat.isFile()) return [fullPath];

  const files = [];
  const stack = [fullPath];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const childPath = path.join(current, entry.name);
      if (shouldSkip(childPath)) continue;
      if (entry.isDirectory()) {
        stack.push(childPath);
      } else if (isSourceFile(childPath)) {
        files.push(childPath);
      }
    }
  }

  return files;
}

function readSources() {
  return SOURCE_DIRS.flatMap((entry) => listFiles(entry)).map((filePath) => ({
    filePath,
    content: fs.readFileSync(filePath, "utf8"),
  }));
}

describe("Static security checks", () => {
  const sources = readSources();

  it("does not use eval or Function constructor in source files", () => {
    const evalPattern = /\beval\s*\(|\bnew\s+Function\s*\(/;

    const matches = sources
      .filter(({ content }) => evalPattern.test(content))
      .map(({ filePath }) => path.relative(ROOT, filePath));

    expect(matches).toEqual([]);
  });

  it("does not include obvious hardcoded secrets in source files", () => {
    const secretPatterns = [
      /AIza[0-9A-Za-z-_]{35}/,
      /sk_(live|test)_[0-9A-Za-z]{16,}/,
      /-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----/,
      /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"][^'"]+['"]/,
    ];

    const matches = [];

    for (const { filePath, content } of sources) {
      const hasSecret = secretPatterns.some((pattern) => pattern.test(content));
      if (hasSecret) {
        matches.push(path.relative(ROOT, filePath));
      }
    }

    expect(matches).toEqual([]);
  });
});
