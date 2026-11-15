# 07 — Cosmic Copilot AI Functionality & Security Audit

## 1. Provider & Model Configuration

- **AI Provider:** Groq Cloud API (`https://api.groq.com/openai/v1`)
- **Configured Model:** `openai/gpt-oss-20b` (Production Open-Weight Reasoning Architecture)
- **SDK & Client:** `groq>=0.11.0` using `AsyncGroq(api_key=settings.GROQ_API_KEY)`
- **Generation Limits:** Max output tokens: 700, Timeout: 25 seconds, Temperature: 0.6

---

## 2. Live Integration & Conversational Intelligence Evidence

Live end-to-end integration was executed and recorded via Puppeteer automated verification scripts and pytest suites.

### Multi-Turn Conversation Log (Recorded Live)
1. **Turn 1 (Astronomical Inquiry):**
   - *User:* "What is WISE 0855?"
   - *Cosmic Copilot (Streaming):* Delivered a 3-paragraph explanation describing WISE 0855−0714 as a sub-stellar cold brown dwarf (~250 K / −23 °C), located 7.26 ly away, exhibiting candidate atmospheric water-ice clouds.
   - *Extracted Actions:* `Inspect WISE 0855 Spectra`, `WISE 0855 Details`, `Mission 02: Invisible World`, `Open Time Machine`.
2. **Turn 2 (Multi-Turn Pronoun Reference):**
   - *User:* "Why is it invisible in optical light?"
   - *Cosmic Copilot (Streaming):* Successfully resolved "it" to WISE 0855. Explained Wien's displacement law, peak thermal infrared emission, atmospheric absorption of visible photons by $H_2O$ and $CH_4$, and why optical surveys (DSS2) show no signal while SPHEREx near-infrared channels detect it clearly.
3. **Turn 3 (Tool Navigation):**
   - User clicked `Inspect WISE 0855 Spectra`.
   - Browser transitioned smoothly to `/spectra?object=wise-0855`.

---

## 3. Rate Limiting & Atomic Budget Verification

| Layer | Configured Limit | Mechanism | Verified Behavior |
| :--- | :---: | :--- | :--- |
| **Session Rate Limit** | 5 req / min, 30 req / day | SQLite rolling window | Rapid submission of 6 requests triggers friendly HTTP 429 fallback event. |
| **IP Rate Limit** | 8 req / min, 60 req / day | SQLite rolling window | Enforced on client IP from `X-Forwarded-For` / `CF-Connecting-IP`. |
| **Global Allowance** | 15 req / min, 300 req / day | SQLite rolling window | Caps application-wide burst consumption. |
| **Global Concurrency** | Max 2 simultaneous | Atomic check in `copilot_budget.db` | Reject with "system busy" if concurrency threshold reached. |
| **Daily Token Budget** | 150,000 tokens | Atomic reservation (`BEGIN IMMEDIATE`) | Pre-allocates input + max output tokens; reconciles post-call. |
| **Circuit Breaker** | Trips after 3 failures | In-memory 60s cooldown | Automatically diverts traffic to deterministic knowledge base upon provider error. |
| **Emergency Kill Switch** | `COSMIC_AI_ENABLED=false` | Server environment setting | Instantly shuts off Groq requests with 0 frontend rebuilds. |

---

## 4. UI Streaming & Lenis Scroll Isolation

- **Streaming Protocol:** Server-Sent Events (`POST /api/assistant/stream` with `Content-Type: text/event-stream`).
- **Stop Generating:** Supported via frontend `AbortController` cancelling the fetch stream.
- **Copy Response:** Supported with clipboard icon and visual confirmation.
- **Scroll Isolation:** The message scroll container contains `data-lenis-prevent` and `overscroll-behavior: contain`. Verified in Puppeteer that mousewheel scrolling inside the chat window produces $0\text{ px}$ of window scroll on the Journey page.
