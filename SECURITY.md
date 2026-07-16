# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report them privately using one of these channels:

- Email: **contact@acefolio.dev**
- GitHub Security Advisories: use the **Report a vulnerability** button on the repository Security tab (once enabled)

Include as much detail as possible:

- Description of the issue and potential impact
- Steps to reproduce
- Affected commands, files, or versions
- Proof-of-concept if available
- Suggested fix (optional)

## What to expect

- **Acknowledgment** within 3 business days
- **Initial assessment** within 7 business days
- **Status updates** at least every 14 days until resolved

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
