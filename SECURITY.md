# Security Policy

SPHERExplore is a web platform for exploring NASA SPHEREx observations, astronomical data and citizen-science workflows. We welcome responsible reports that help protect our users, infrastructure and scientific data.

## Supported versions

| Version | Security support |
| --- | --- |
| Latest release deployed from `main` | Best-effort security fixes |
| Current `main` branch | Best-effort security fixes |
| Older releases and development branches | Not actively supported |

SPHERExplore is a student-led project. Response and remediation times depend on severity, available resources and the ability to reproduce the issue.

## Reporting a vulnerability

Please report suspected security vulnerabilities privately rather than opening a public issue with exploit details.

1. Visit the repository's [Security tab](https://github.com/ZAK1504/NASA_SPACE/security).
2. If GitHub private vulnerability reporting is enabled, use [Report a vulnerability](https://github.com/ZAK1504/NASA_SPACE/security/advisories/new) to submit your report.
3. If private reporting is unavailable, open a public issue requesting a private reporting channel. Do not include vulnerability details, credentials, affected user information or proof-of-concept exploits in that issue.

Include the following in a private report where applicable:

- A clear description and potential security impact.
- The affected URL, endpoint, component or commit.
- Minimal, safe steps to reproduce the issue.
- Expected and observed behavior.
- Relevant screenshots or sanitized logs.
- Any suggested remediation.

Never send live API keys, access tokens, passwords or personal data. Redact sensitive values and share only the minimum evidence needed to reproduce the issue.

## Scope

Reports concerning code or infrastructure maintained by this project are welcome, including:

- The SPHERExplore frontend and backend API.
- Authentication, authorization, session handling and access control, where applicable.
- Cross-site scripting, injection, insecure request handling, SSRF and unsafe file processing.
- FITS, WCS, HiPS and other astronomical data ingestion or processing vulnerabilities.
- Exposure of Groq API keys, cloud credentials or other secrets.
- Cosmic Copilot security, including prompt injection that causes unauthorized actions or sensitive information disclosure, rate-limit bypass and abuse of API budgets.
- Deployment configuration, CORS, TLS, dependency vulnerabilities and supply-chain risks.
- Unauthorized access to or modification of project-managed scientific data, caches or databases.

The project integrates external services and public NASA data. Vulnerabilities in third-party services or NASA infrastructure that are not caused by SPHERExplore should be reported through the relevant provider's own security channels.

## Responsible testing and disclosure

- Prefer a local development instance or an isolated test environment.
- Do not access, modify or delete other users' data or production scientific data.
- Do not attempt denial-of-service attacks, high-volume scanning, brute force, quota exhaustion or other disruptive testing.
- Do not use exposed credentials or access infrastructure without authorization.
- Stop testing if you encounter sensitive information or risk of harm.
- Allow maintainers a reasonable opportunity to investigate and remediate before publicly disclosing exploit details.
- Coordinate disclosure with maintainers where practical.

This policy does not authorize testing of third-party infrastructure or access beyond what the project maintainers are permitted to authorize.

## How we handle reports

Maintainers will make a best-effort attempt to acknowledge, reproduce and assess privately reported vulnerabilities. We prioritize issues based on exploitability, impact, affected users and available mitigations. Where appropriate, we may coordinate a fix, rotate exposed credentials and publish a GitHub security advisory after remediation.

Please keep reports confidential during investigation. We appreciate constructive collaboration and responsible disclosure.

## Security practices for contributors

- Keep secrets on the backend or in approved secret storage; never commit `.env` files containing credentials or expose secrets through Vite client variables.
- Validate untrusted inputs, especially external data URLs, uploaded files and chatbot messages.
- Preserve authorization checks, rate limits and resource budgets.
- Review dependency changes and security alerts.
- Use pull requests for security-sensitive changes and avoid including private data in commits, logs or screenshots.
- Document security-relevant behavior and add regression tests when fixing vulnerabilities.

Security issues should be handled privately until an appropriate mitigation or disclosure plan is in place.


## Security engineering requirements

These are mandatory design and review requirements for new changes, and remediation targets for existing code. They are not a claim that all controls are already implemented or independently verified.

### Repository and software supply chain

- Protect the default branch: require reviewed pull requests and passing security/build checks; prohibit force pushes and deletion. Apply protections to maintainers where practical.
- Enable GitHub private vulnerability reporting, dependency graph, Dependabot alerts and security updates, secret scanning and push protection, and CodeQL code scanning where available.
- Require least-privilege GitHub Actions permissions. Use immutable full-length commit SHAs for actions, do not expose deployment secrets to untrusted pull requests, and do not execute untrusted PR code with `pull_request_target` privileges.
- Review dependency changes and lockfiles. Use the committed npm lockfile for reproducible frontend builds. Maintain a reviewed, fully resolved Python dependency lock or constraints file for production; generate it for the deployment Python/platform, test it, and use hashes where feasible.
- Investigate all reported vulnerabilities. Do not bypass failing security checks, silently suppress advisories, or apply breaking automated upgrades without testing. Document justified, time-limited exceptions with an owner and a remediation date.
- Keep production credentials, live data, SQLite journals, virtual environments and scientific cache files out of Git. Rotate any exposed secret immediately; deleting a file from the latest commit is not sufficient.

### Application and API security

- Apply server-side validation and authorization to every operation that reads or mutates protected data. Treat identifiers, headers, query parameters, uploads, remote URLs and chatbot context as untrusted.
- Use an explicit CORS origin allowlist for the production frontend. Avoid credentialed wildcard CORS. Use appropriate secure cookie attributes and CSRF protection for cookie-authenticated state changes.
- Prevent injection and XSS through safe APIs, parameterized queries, contextual output escaping, and sanitization of any rendered untrusted HTML or Markdown. Avoid unsafe deserialization.
- Restrict outbound archive requests to approved HTTPS providers and destinations; validate redirects, resolved addresses and response sizes to prevent SSRF and resource exhaustion. Never allow arbitrary requests to internal services or cloud metadata endpoints.
- Enforce request-body, file, image-dimension, decompression, processing-time and concurrency limits. Apply quotas and rate limiting to expensive scientific operations as well as the AI assistant. Use bounded queues and timeouts where appropriate.
- Protect FITS/HiPS ingestion against malformed files, path traversal, cache poisoning, and unsafe filename handling. Store generated data outside executable and publicly writable locations.
- Return sanitized errors; never expose secrets, stack traces, local filesystem details or sensitive request contents in public responses. Avoid recording secrets or personal data in logs.

### Cosmic Copilot and Groq

- Keep Groq credentials exclusively on the backend, preferably in managed secret storage with least-privilege access. Never expose them to client code, prompts, analytics, or logs.
- Restrict the assistant to SPHEREx, astronomy and relevant platform/scientific questions. Treat retrieved data, user messages, context and history as untrusted, not as system instructions.
- Enforce topic restrictions and abuse controls on both streaming and non-streaming endpoints. Preserve legitimate scientific follow-ups and test adversarial and mixed-topic requests.
- Enforce per-client and global request, concurrency and token budgets. Do not rely solely on client-supplied session identifiers or spoofable forwarding headers.
- Do not grant the model arbitrary command execution, unrestricted network access or access to credentials. Validate all suggested navigation actions against approved destinations.
- Apply safe rendering and output handling to model responses. Treat prompt injection defenses as risk reduction, not a guarantee.

### Production infrastructure and recovery

- Expose only necessary services; keep FastAPI bound to loopback behind Nginx. Limit administrative access using IAM, OS Login and restricted SSH access (prefer IAP where feasible).
- Run application processes with dedicated unprivileged accounts and minimum filesystem permissions. Avoid broad cloud IAM roles and long-lived service-account keys.
- Enforce HTTPS with valid certificate renewal. Evaluate and test HSTS, Content-Security-Policy, anti-framing, MIME-sniffing and referrer controls before rollout; allow required scientific resources explicitly.
- Store secrets with restrictive access, rotate them after suspected exposure, and separate development and production credentials.
- Keep the OS, Nginx and runtime dependencies patched. Monitor service health, abuse, anomalous traffic and security events without logging sensitive contents.
- Maintain restricted, tested backups of irreplaceable application state and deployment configuration. Document recovery steps and test restoration without overwriting live data.
- Review the security impact of every production release, test in an isolated environment, and maintain a rollback path.

## Vulnerability triage and incident response

We aim to acknowledge reports within 3 business days, begin assessment promptly, and prioritize containment and remediation of actively exploited or critical vulnerabilities. These are best-effort targets, not guaranteed service-level commitments.

| Severity | Examples | Target action |
| --- | --- | --- |
| Critical | Remote code execution, exposed production credentials, active compromise | Immediate containment and urgent remediation |
| High | Significant unauthorized access, exploitable injection, serious secret or data exposure | Prioritize a fix and mitigation |
| Medium | Limited-impact exploitable weakness | Schedule remediation based on impact |
| Low | Minor hardening gap or defense-in-depth issue | Track and resolve through normal maintenance |

For a suspected incident, restrict the affected service or capability as needed, preserve relevant evidence, revoke or rotate compromised credentials, investigate scope, remediate, and verify recovery. Coordinate notifications and disclosure based on affected users, applicable obligations, and confirmed impact.

## Verification and security baselines

Use the [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/) (target applicable Level 2 requirements), [OWASP API Security Top 10](https://owasp.org/API-Security/) and [OWASP GenAI Security Project](https://genai.owasp.org/) as review baselines. These are engineering targets, not certifications.

Before a security-sensitive release, review dependency audit results, code scanning and secret scanning alerts, relevant regression tests, authorization and abuse controls, and production configuration. Security testing must not expose live secrets or disrupt public scientific services. Report unresolved findings and limitations explicitly.
