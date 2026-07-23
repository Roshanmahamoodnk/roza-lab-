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
- `assistant-server.js` — Node/Express assistant endpoint for `/api/assistant`
- `.env.example` — environment variables for OpenAI, Tavily, and LangSmith tracing

## Live assistant setup
- Serve the static site and the assistant backend from the same origin, or set `ROZA_CONFIG.assistantEndpoint` to your deployed API URL.
- Set `LANGCHAIN_TRACING_V2=true`, `LANGCHAIN_PROJECT=roza-lab-assistant`, and the matching LangSmith / LangChain API key env vars on the backend.
- Set `OPENAI_API_KEY` and `TAVILY_API_KEY` so the assistant can research live and answer as Roza Lab Assistant.

## Focus
- premium, human-authored design
- advanced motion and atmospheric visuals
- pairing intelligence with rejected combinations
- formulation and process clarity
- manufacturing and QSR scale path
- custom visuals and a studio-like assistant experience
