# Your Own Browser Server for Fleet
### (self-hosted browser-use + live view + takeover — no Browser Use Cloud credits, no LLM key)

What this gives you:

- A browser running in your cloud container, not on your laptop
- Fleet drives it directly through low-level MCP tools like navigate, click, type, and extract
- A live view page where you can watch the browser and take over for logins, MFA, or CAPTCHAs
- A persistent browser profile so logins survive restarts

Monthly cost: just the hosting, roughly a small Railway or Fly.io instance.

---

## Where to point Railway

Set the Railway service's *Root Directory* to:

```text
browser-server
```

That folder contains the Dockerfile Railway should use.

## Quick start locally

1. Copy the env file:

```bash
cp .env.example .env
```

2. Fill in the values in `.env`:

- `APPROVAL_PIN` = your 4-digit approval code, for example `1234`
- `RECOVERY_EMAIL` = your email address for recovery notes
- `PORT` = usually `8080`

3. Start the container:

```bash
docker compose up --build
```

4. Open:

- `http://localhost:8080/` → service status
- `http://localhost:8080/view/vnc.html` → live browser view
- `http://localhost:8080/mcp` → MCP endpoint for Fleet

## Railway deploy

1. Push this repo to GitHub.
2. In Railway, set the service's *Root Directory* to `browser-server`.
3. Set these variables in Railway:

```env
PORT=8080
APPROVAL_PIN=1234
RECOVERY_EMAIL=chakkumamu8777@gmail.com
BU_CDP_URL=http://127.0.0.1:9222
```

4. Give the service a public domain.
5. If you want persistence across restarts, add a volume at `/data`.
6. If you want Langfuse traces for browser-server health probes, also set:

```env
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com
LANGFUSE_TRACE_INTERVAL_SECONDS=60
```

With those Langfuse vars present, the container emits periodic `browser-server-probe` traces that capture process status, TCP ports, and the local HTTP checks for `/`, `/healthz`, and `/readyz`.

## Connect it to Fleet

Add a custom MCP connection:

- URL: `https://your-service.example/mcp`
- Header: `x-approval-pin: <APPROVAL_PIN>`

Then enable the browser tools in the agent settings.

## Watch and take over

Open:

```text
https://your-service.example/view/vnc.html
```

Use the same `APPROVAL_PIN` from your env file. You can watch the session live and take control when needed.

## Notes

- There is no LLM key in this template.
- The browser is exposed through a public URL so Fleet can reach it.
- `RECOVERY_EMAIL` is just a simple recovery contact for your setup notes; the minimal version still uses the 4-digit approval PIN as the actual gate.
- `BU_CDP_URL` tells browser-use to attach to the Chromium instance that starts inside the container, which is the fast path that avoids per-call relaunches.
- `/healthz` returns quickly so Railway can see the service is alive; `/readyz` checks whether the MCP bridge is ready.
- If you want a VM-based version instead of Railway, I can adapt the same layout for that.
