# Security Policy

## Supported Versions

We provide security fixes for supported releases only. If a version is not listed as supported, it will not receive security updates.

| Version | Supported |
| ------- | --------- |
| 5.1.x   | ✅        |
| 5.0.x   | ❌        |
| 4.0.x   | ✅        |
| < 4.0   | ❌        |

If you are using an unsupported version, please plan an upgrade to a supported release.

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately to our security team:

- Email: security@atonixcorp.org
- GitHub: Create a private Security Advisory on this repository (recommended) or open a confidential issue if available.

When reporting, include the following information:
- Short summary and impact
- Affected versions
- Steps to reproduce (minimal example or PoC if possible)
- Expected vs actual behavior
- Any known workarounds or mitigations
- Attachments or logs if helpful (encrypt if sensitive)

For sensitive data, encrypt your report using our PGP key. We will publish our public key in the repository at `.github/SECURITY_PGP.pub`. If you need the key delivered another way, indicate that in your email.

---

## Triage and Response Timeline

We aim to handle reports as follows:
- Acknowledgement: within 72 hours
- Initial triage: within 7 days
- Remediation plan or patch: within 30 days for high-severity issues when possible
- Regular updates: every 7 days until resolution

If a fix requires coordination with third-party vendors or cloud providers, timelines may vary; we will keep reporters informed.

---

## Disclosure Policy

We prefer coordinated disclosure. After a fix is released, we will notify the reporter and publish a security advisory detailing the issue and remediation. Typical embargo period is up to 90 days from the first report; exceptions may be made for critical vulnerabilities.

If you plan to publicly disclose a vulnerability, please notify us in advance to coordinate timelines.

---

## Severity and Remediation Guidance

We use CVSS v3 where applicable to classify severity. General guidance:
- Critical (CVSS ≥ 9): immediate action and patch release
- High (7–8.9): patch in a short cadence (days to weeks)
- Medium (4–6.9): scheduled fix (weeks)
- Low (<4): tracked for future releases

When possible, include recommended remediation steps and mitigations in the report to speed up resolution.

---

## Safe Harbor

If you follow this policy and act in good faith to avoid privacy violations, destruction of data, or service disruption, we will not pursue legal action against security researchers who follow responsible disclosure practices.

Do not perform testing that could harm user data or production services without prior authorization.

---

## Contact & Next Steps

- Email: security@atonixcorp.org
- Add a Security Advisory on GitHub for confidential reports
- For encrypted reports: use the PGP public key at `.github/SECURITY_PGP.pub`

Thank you for helping keep the project secure.
