# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report them privately using one of these channels:

- Email: **dev.muhammad.atif@gmail.com**
- GitHub Security Advisories: use the **Report a vulnerability** button on the repository Security tab (once enabled)

Include as much detail as possible:

- Description of the issue and potential impact
- Steps to reproduce
- Affected commands, files, or versions
- Proof-of-concept if available
- Suggested fix (optional)

## What to expect

This is an early-stage, independently maintained project. We aim to acknowledge reports promptly and coordinate an assessment and disclosure timeline with you. There is no guaranteed response time.

We will coordinate disclosure timing with you and credit reporters when appropriate (unless you prefer to remain anonymous).

## Scope

In scope:

- Remote code execution or arbitrary file access via ECS CLI inputs
- Path traversal or unsafe file writes in `.evolution/`
- Credential or secret leakage through logs or object storage
- Supply-chain risks in release artifacts

Out of scope:

- Social engineering attacks
- Denial of service from local misuse
- Issues requiring physical access to a maintainer machine
- Vulnerabilities in third-party dependencies already fixed upstream (please still report so we can update)

## Safe harbor

We support good-faith security research. Do not access data you do not own, disrupt services, or exploit issues beyond what is needed to demonstrate the vulnerability.

Thank you for helping keep ECS and its users safe.

## Dependency review (9 October 2026)

The current locked runtime dependencies report no known advisories in `npm audit --omit=dev`. A high-severity `braces` stack-exhaustion advisory remains in the development-only `tsc-alias` glob/watch dependency chain. It is not shipped as a CLI runtime dependency. Avoid untrusted custom build glob patterns; track the upstream fix. npm's suggested downgrade of the build tool was not applied without compatibility evidence. Audit results do not guarantee the absence of vulnerabilities.
