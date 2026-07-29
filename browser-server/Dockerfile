# Self-hosted agent-browser MCP server with live view (noVNC) for Fleet
# One container: Fleet's agent drives the browser directly over MCP,
# you watch and take over at https://<your-app>/view/vnc.html

FROM python:3.12-bookworm

ENV DEBIAN_FRONTEND=noninteractive \
    DISPLAY=:99 \
    PORT=8080 \
    HOME=/root \
    XDG_CONFIG_HOME=/root/.config

# System deps: virtual display, VNC, noVNC web client, process manager, Caddy proxy, Node, Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      xvfb x11vnc novnc websockify supervisor \
      curl gnupg debian-keyring debian-archive-keyring apt-transport-https \
      nodejs npm chromium \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list \
    && apt-get update && apt-get install -y --no-install-recommends caddy \
    && rm -rf /var/lib/apt/lists/*

# supergateway bridges agent-browser's stdio MCP to streamable HTTP (what Fleet needs)
RUN npm install -g supergateway agent-browser

# Optional trace probes for startup and health checks
RUN pip install --no-cache-dir langfuse

# Persistent browser profile directory for logins and downloads
RUN mkdir -p /data/profile /etc/caddy

COPY supervisord.conf /etc/supervisord.conf
COPY Caddyfile /etc/caddy/Caddyfile
COPY trace_monitor.py /opt/trace_monitor.py
RUN chmod +x /opt/trace_monitor.py

EXPOSE 8080 8931 5900 6080

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
