#!/usr/bin/env python3
"""Emit a Langfuse trace that summarizes browser-server health.

The process is intentionally lightweight and optional:
- If Langfuse credentials are missing, it prints the probe snapshot to stdout.
- If Langfuse credentials are present, it emits a trace with nested spans for
  the browser-server process tree, socket checks, and HTTP checks.

This is meant to make startup failures visible in Langfuse without changing the
browser runtime itself.
"""

from __future__ import annotations

import json
import os
import socket
import subprocess
import time
from datetime import datetime, timezone
from typing import Dict, List

INTERVAL_SECONDS = int(os.getenv("LANGFUSE_TRACE_INTERVAL_SECONDS", "60"))
PORT = int(os.getenv("PORT", "8080"))

PROCESS_PATTERNS = {
    "xvfb": "Xvfb :99",
    "x11vnc": "x11vnc -display :99",
    "novnc": "websockify --web /usr/share/novnc 6080 127.0.0.1:5900",
    "mcp": 'supergateway --stdio "agent-browser --cdp 9222 mcp --tools core"',
    "caddy": "caddy run --config /etc/caddy/Caddyfile",
}

TCP_PORTS = [5900, 6080, 8931, PORT]
HTTP_URLS = {
    "root": f"http://127.0.0.1:{PORT}/",
    "healthz": f"http://127.0.0.1:{PORT}/healthz",
    "readyz": f"http://127.0.0.1:{PORT}/readyz",
}


def maybe_get_langfuse():
    public_key = os.getenv("LANGFUSE_PUBLIC_KEY")
    secret_key = os.getenv("LANGFUSE_SECRET_KEY")
    if not public_key or not secret_key:
        return None

    host = os.getenv("LANGFUSE_HOST")
    if host:
        os.environ["LANGFUSE_HOST"] = host

    try:
        from langfuse import get_client

        return get_client()
    except Exception as exc:  # pragma: no cover - best-effort tracing
        print(f"[langfuse-probe] Langfuse disabled: {exc}", flush=True)
        return None


def run_cmd(command: List[str], timeout_seconds: int = 8) -> Dict[str, object]:
    try:
        completed = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False,
        )
        return {
            "ok": completed.returncode == 0,
            "returncode": completed.returncode,
            "stdout": completed.stdout[-2000:],
            "stderr": completed.stderr[-2000:],
        }
    except Exception as exc:
        return {"ok": False, "error": repr(exc)}


def tcp_check(port: int, host: str = "127.0.0.1", timeout_seconds: int = 2) -> Dict[str, object]:
    try:
        with socket.create_connection((host, port), timeout=timeout_seconds):
            return {"ok": True, "host": host, "port": port}
    except Exception as exc:
        return {"ok": False, "host": host, "port": port, "error": repr(exc)}


def curl_get(url: str) -> Dict[str, object]:
    return run_cmd(["curl", "-fsS", url], timeout_seconds=8)


def collect_snapshot() -> Dict[str, object]:
    processes = {
        name: run_cmd(["pgrep", "-af", pattern]) for name, pattern in PROCESS_PATTERNS.items()
    }
    ports = {str(port): tcp_check(port) for port in TCP_PORTS}
    http_checks = {name: curl_get(url) for name, url in HTTP_URLS.items()}

    missing_processes = [name for name, result in processes.items() if not result.get("ok")]
    closed_ports = [port for port, result in ports.items() if not result.get("ok")]
    failed_http = [name for name, result in http_checks.items() if not result.get("ok")]

    summary = "ok" if not missing_processes and not closed_ports and not failed_http else "degraded"

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "summary": summary,
        "missing_processes": missing_processes,
        "closed_ports": closed_ports,
        "failed_http": failed_http,
        "processes": processes,
        "ports": ports,
        "http_checks": http_checks,
    }


def emit_langfuse_trace(client, snapshot: Dict[str, object]) -> None:
    root_input = {
        "timestamp": snapshot["timestamp"],
        "summary": snapshot["summary"],
        "missing_processes": snapshot["missing_processes"],
        "closed_ports": snapshot["closed_ports"],
        "failed_http": snapshot["failed_http"],
        "ports": TCP_PORTS,
        "http_urls": list(HTTP_URLS.keys()),
    }

    with client.start_as_current_observation(
        as_type="span",
        name="browser-server-probe",
        input=root_input,
    ) as root_span:
        for name, result in snapshot["processes"].items():
            with root_span.start_as_current_observation(
                as_type="span",
                name=f"process:{name}",
                input={"pattern": PROCESS_PATTERNS[name]},
            ) as child_span:
                child_span.update(output=result)

        with root_span.start_as_current_observation(
            as_type="span",
            name="socket-checks",
            input={"ports": TCP_PORTS},
        ) as child_span:
            child_span.update(output=snapshot["ports"])

        with root_span.start_as_current_observation(
            as_type="span",
            name="http-checks",
            input={"urls": HTTP_URLS},
        ) as child_span:
            child_span.update(output=snapshot["http_checks"])

        root_span.update(
            output={
                "summary": snapshot["summary"],
                "missing_processes": snapshot["missing_processes"],
                "closed_ports": snapshot["closed_ports"],
                "failed_http": snapshot["failed_http"],
            }
        )

    client.flush()


def main() -> None:
    client = maybe_get_langfuse()

    while True:
        snapshot = collect_snapshot()
        if client:
            try:
                emit_langfuse_trace(client, snapshot)
            except Exception as exc:  # pragma: no cover - best-effort tracing
                print(f"[langfuse-probe] trace emit failed: {exc}", flush=True)
                print(json.dumps(snapshot, indent=2, sort_keys=True), flush=True)
        else:
            print(json.dumps(snapshot, indent=2, sort_keys=True), flush=True)

        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
