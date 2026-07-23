# Rozalab × Carino

Cryogenic flavour engineering site for Carino. The main experience is a dark, cinematic, motion-rich single-page studio that presents pairing logic, sample development, SOP, CCP, scale-up, and a live assistant layer.

## Main experience
- `index.html` — immersive cryogenic studio homepage

## Supporting pages
- `brand.html` — brand vision and visual system
- `menu.html` — pairing atlas and SKU direction
- `operations.html` — SOP, CCP, and equipment stack
- `lab.html` — evidence room and build trace
- `launch.html` — client intake and tasting requests

## Live assistant backend
- `api/assistant.js` — serverless assistant endpoint for `/api/assistant` on Vercel
- `assistant-server.js` — standalone Node/Express assistant endpoint for custom servers
- `.env.example` — environment variables for OpenAI, Tavily, and LangSmith tracing

## Recommended deployment
- *If you want the assistant to work on the same domain as the site*, deploy the repo to Vercel.
- Vercel will serve the static pages and `api/assistant.js` together, so the frontend can call `/api/assistant` directly.
- GitHub Pages can only host the static files; it cannot run the live assistant endpoint.

## Live assistant setup
- Set `OPENAI_API_KEY` and `TAVILY_API_KEY` so the assistant can research live and answer as Roza Lab Assistant.
- Set `LANGCHAIN_TRACING_V2=true` and `LANGCHAIN_PROJECT=roza-lab-assistant`.
- Set `LANGCHAIN_API_KEY` (and optionally `LANGSMITH_API_KEY` / `LANGSMITH_PROJECT`) on the backend host.
- If you use a custom server instead of Vercel, set `ALLOWED_ORIGIN=https://roshanmahamoodnk.github.io` or your live frontend origin.

## Focus
- premium, human-authored design
- advanced motion and atmospheric visuals
- pairing intelligence with rejected combinations
- formulation and process clarity
- manufacturing and QSR scale path
- custom visuals and a studio-like assistant experience
