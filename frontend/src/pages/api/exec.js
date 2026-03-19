import { execSync } from "child_process";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: "command required" });
  const allowed = [/^openclaw\s/, /^ollama\s/, /^cat\s/, /^ls\s/, /^head\s/, /^tail\s/, /^grep\s/, /^wc\s/, /^curl\s+(-s\s+)?http:\/\/localhost/];
  if (!allowed.some(r => r.test(command))) return res.status(403).json({ error: "Command not allowed." });
  try {
    const output = execSync(command, { timeout: 15000, encoding: "utf8", maxBuffer: 1024 * 512 });
    res.json({ output, exitCode: 0 });
  } catch (err) { res.json({ output: err.stdout || err.stderr || err.message, exitCode: 1 }); }
}
