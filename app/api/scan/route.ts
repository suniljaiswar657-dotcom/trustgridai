import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import https from "node:https";
import type { IncomingMessage } from "node:http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isPublicIp(ip: string) {
  if (isIP(ip) === 4) {
    const p = ip.split(".").map(Number);
    return !(p[0] === 0 || p[0] === 10 || p[0] === 127 || p[0] >= 224 ||
      (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
      (p[0] === 192 && p[1] === 0) || (p[0] === 198 && (p[1] === 18 || p[1] === 19)));
  }
  const v = ip.toLowerCase();
  return !(v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") ||
    v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb") ||
    v.startsWith("::ffff:127.") || v.startsWith("::ffff:10.") || v.startsWith("::ffff:192.168."));
}

function requestHead(host: string, address: string, family: number): Promise<{ status: number; headers: Record<string, string | string[] | undefined>; server: string; title: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: host, path: "/", method: "GET", servername: host, timeout: 8000, maxHeaderSize: 16384,
      headers: { "User-Agent": "TRUSTGRID-SignalScanner/1.0", "Accept": "text/html,application/xhtml+xml,*/*;q=0.5", "Range": "bytes=0-32767" },
      lookup: ((hostname: string, options: unknown, callback: (err: Error | null, address: string, family: number) => void) => callback(null, address, family)) as never
    }, (res: IncomingMessage) => {
      const chunks: Buffer[] = [];
      let size = 0;
      res.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size <= 32768) chunks.push(chunk);
        else res.destroy();
      });
      res.on("end", () => {
        const html = Buffer.concat(chunks).toString("utf8");
        const title = html.match(/<title[^>]*>([^<]{1,180})<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "";
        const headers: Record<string, string | string[] | undefined> = {};
        for (const [key, value] of Object.entries(res.headers)) headers[key] = value;
        resolve({ status: res.statusCode || 0, headers, server: String(res.headers.server || "Not disclosed"), title });
      });
      res.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error("The website took too long to respond.")));
    req.on("error", reject);
    req.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raw = typeof body?.url === "string" ? body.url.trim() : "";
    if (!raw || raw.length > 2048) return NextResponse.json({ error: "Enter a valid HTTPS website URL." }, { status: 400 });
    const url = new URL(raw.includes("://") ? raw : "https://" + raw);
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) {
      return NextResponse.json({ error: "Only public HTTPS websites on the standard port can be scanned." }, { status: 400 });
    }
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (!host.includes(".") || host === "localhost" || host.endsWith(".local") || isIP(host)) {
      return NextResponse.json({ error: "Enter a public domain name, not a local or private address." }, { status: 400 });
    }
    const records = await lookup(host, { all: true, verbatim: true });
    if (!records.length || records.some((record) => !isPublicIp(record.address))) {
      return NextResponse.json({ error: "This domain resolves to a restricted or non-public network address." }, { status: 400 });
    }
    const result = await requestHead(host, records[0].address, records[0].family);
    const checks = [
      { label: "HTTPS connection", status: "pass", detail: "TLS connection succeeded and the certificate was accepted by the runtime." },
      { label: "HTTP response", status: result.status >= 200 && result.status < 400 ? "pass" : "review", detail: "The server returned HTTP " + result.status + "." },
      { label: "Strict-Transport-Security", status: result.headers["strict-transport-security"] ? "pass" : "review", detail: result.headers["strict-transport-security"] ? "HSTS response header is present." : "HSTS response header was not detected." },
      { label: "Content Security Policy", status: result.headers["content-security-policy"] ? "pass" : "review", detail: result.headers["content-security-policy"] ? "A Content-Security-Policy header is present." : "No Content-Security-Policy header was detected." },
      { label: "X-Content-Type-Options", status: result.headers["x-content-type-options"] ? "pass" : "review", detail: result.headers["x-content-type-options"] ? "MIME-sniffing protection header is present." : "MIME-sniffing protection header was not detected." },
      { label: "Referrer Policy", status: result.headers["referrer-policy"] ? "pass" : "info", detail: result.headers["referrer-policy"] ? "A referrer policy is declared." : "No referrer policy was detected." },
      { label: "Permissions Policy", status: result.headers["permissions-policy"] ? "pass" : "info", detail: result.headers["permissions-policy"] ? "A permissions policy is declared." : "No permissions policy was detected." }
    ];
    const passed = checks.filter((c) => c.status === "pass").length;
    const score = Math.round((passed / checks.length) * 100);
    return NextResponse.json({
      domain: host, score, grade: score >= 80 ? "Strong signals" : score >= 55 ? "Mixed signals" : "Needs review",
      httpStatus: result.status, server: result.server, title: result.title, checks,
      scannedAt: new Date().toISOString(),
      disclaimer: "Limited technical signals only. This is not a security audit, malware scan, business identity verification or guarantee of legitimacy."
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to scan this website.";
    return NextResponse.json({ error: message.includes("ENOTFOUND") ? "Domain could not be resolved." : message.includes("certificate") || message.includes("CERT") ? "TLS certificate validation failed." : "Website could not be reached safely. Check the domain and try again." }, { status: 502 });
  }
}
