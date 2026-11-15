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
