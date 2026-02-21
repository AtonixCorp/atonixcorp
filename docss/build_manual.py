#!/usr/bin/env python3
"""
AtonixCorp Project Manual – PDF Builder
Assembles all .md files from the docss/ folder into a single, well-structured
PDF manual using pandoc + pdflatex.

Usage:  python3 docss/build_manual.py
Output: assets/AtonixCorp_Manual.pdf
"""

import os
import re
import subprocess
import sys
from pathlib import Path

ROOT   = Path(__file__).resolve().parent.parent  # project root
DOCSS  = Path(__file__).resolve().parent          # docss/
OUTPUT = ROOT / "assets" / "AtonixCorp_Manual.pdf"
MERGED = DOCSS / "_merged.md"

# ──────────────────────────────────────────────────────────
#  Reading order – most important sections first
# ──────────────────────────────────────────────────────────
ORDERED = [
    # ── Overview & Quick Start ───────────────────────────
    ("README.md",                             "Project Overview"),
    ("ATONIXCORP_HOMEPAGE.md",                "About AtonixCorp"),
    ("QUICKSTART.md",                         "Quick Start Guide"),
    ("LAUNCH_GUIDE.md",                       "Launch Guide"),

    # ── Architecture ─────────────────────────────────────
    ("INFRASTRUCTURE.md",                     "Infrastructure Overview"),
    ("COMPLETE_INFRASTRUCTURE.md",            "Complete Infrastructure"),
    ("PLATFORM_COMPLETE.md",                  "Platform Architecture"),
    ("IMPLEMENTATION_SUMMARY.md",             "Implementation Summary"),
    ("docs/docs/PLATFORM_ARCHITECTURE.md",    "Platform Architecture (Detail)"),

    # ── Developer Setup ───────────────────────────────────
    ("docs/DEVELOPER_REQUIREMENTS.md",        "Developer Requirements"),
    ("docs/LOCAL_RUN.md",                     "Running Locally"),
    ("docs/SPARK_LOCAL_RUN.md",               "Running Spark Locally"),

    # ── Docker ───────────────────────────────────────────
    ("DOCKER_SETUP.md",                       "Docker Setup"),
    ("DOCKER_SETUP_COMPLETE.md",              "Docker Setup (Complete)"),

    # ── Deployment ───────────────────────────────────────
    ("DEPLOYMENT.md",                         "Deployment Guide"),
    ("PRODUCTION-DEPLOYMENT.md",              "Production Deployment"),
    ("docs/DEPLOYMENT_WORKFLOW.md",           "Deployment Workflow"),
    ("docs/docs/DEPLOYMENT_GUIDE.md",         "Deployment Guide (Detail)"),

    # ── Kubernetes & Infrastructure ───────────────────────
    ("k8s/README.md",                         "Kubernetes Overview"),
    ("k8s/notes.md",                          "Kubernetes Notes"),
    ("k8s/base/README-CERTS.md",              "Certificates Setup"),
    ("k8s/base/README-IPV6.md",               "IPv6 Configuration"),
    ("k8s/metallb/README.md",                 "MetalLB Load Balancer"),
    ("k8s/kube-ovn/README.md",                "Kube-OVN Networking"),
    ("k8s/monitoring/README.md",              "Kubernetes Monitoring"),
    ("docs/metallb-ipv6-instructions.md",     "MetalLB IPv6 Instructions"),

    # ── CI/CD & GitOps ────────────────────────────────────
    ("docs/CI_CD_PIPELINE.md",                "CI/CD Pipeline"),
    ("docs/PIPELINE_GHCR.md",                 "GitHub Container Registry Pipeline"),
    ("REGISTRY-PUSH.md",                      "Registry Push Guide"),
    ("gitops/kas/README.md",                  "GitOps (KAS)"),

    # ── Backend Services ─────────────────────────────────
    ("docs/docs/README.md",                   "Backend Documentation Index"),
    ("docs/docs/BACKEND_SERVICES.md",         "Backend Services"),
    ("docs/docs/COMPUTE_SERVICE.md",          "Compute Service"),
    ("docs/docs/STORAGE_SERVICE.md",          "Storage Service"),
    ("docs/docs/NETWORKING_SERVICE.md",       "Networking Service"),
    ("docs/docs/API_REFERENCE.md",            "API Reference"),
    ("docs/docs/IMPLEMENTATION_SUMMARY.md",   "Backend Implementation Summary"),
    ("docs/ATONIX_YAML_SPEC.md",              "Atonix YAML Specification"),
    ("docs/ZOOKEEPER_INTEGRATION.md",         "Zookeeper Integration"),

    # ── Frontend ─────────────────────────────────────────
    ("frontend/README.md",                    "Frontend Overview"),
    ("frontend/QUICK_START.md",               "Frontend Quick Start"),
    ("frontend/NPM_SETUP_GUIDE.md",           "NPM Setup Guide"),
    ("frontend/DASHBOARD_README.md",          "Dashboard"),
    ("frontend/PLATFORM_INTEGRATION.md",      "Frontend Platform Integration"),
    ("frontend/FRONTEND_SETUP_COMPLETE.md",   "Frontend Setup Complete"),
    ("FRONTEND_STATUS_COMPLETE.md",           "Frontend Status"),
    ("FRONTEND_STYLING_ENHANCEMENTS.md",      "Frontend Styling Enhancements"),

    # ── Security ─────────────────────────────────────────
    ("SECURITY.md",                           "Security Policy"),
    ("SECURITY_CHECKLIST.md",                 "Security Checklist"),
    ("SECURITY_IMPLEMENTATION.md",            "Security Implementation"),
    ("SECURITY_DASHBOARD_FINAL_STATUS.md",    "Security Dashboard"),
    ("ENTERPRISE_SECURITY_DASHBOARD_COMPLETE.md", "Enterprise Security Dashboard"),
    ("ENTERPRISE_SECURITY_DELIVERY_COMPLETE.md",  "Enterprise Security Delivery"),
    ("FRONTEND_SECURITY_SETUP.md",            "Frontend Security Setup"),
    ("docs/SECURITY_STANDARDS.md",            "Security Standards"),
    ("docs/security/implementations.md",      "Security Implementations"),
    ("docs/access_control.md",                "Access Control"),
    ("SECURITY_CHECKLIST.md",                 "Security Checklist"),

    # ── Apache / Web Server ───────────────────────────────
    ("APACHE2_GUIDE.md",                      "Apache2 Guide"),
    ("APACHE2_SETUP_SUMMARY.md",              "Apache2 Setup Summary"),
    ("docker/apache2/README.md",              "Apache2 Docker Setup"),
    ("infra/reverse-proxy/README.md",         "Reverse Proxy Setup"),

    # ── Operator ─────────────────────────────────────────
    ("atonixcorp-operator/README.md",         "AtonixCorp Kubernetes Operator"),

    # ── Observability ─────────────────────────────────────
    ("docs/OBSERVABILITY_GUIDE.md",           "Observability Guide"),

    # ── AI & Automation ───────────────────────────────────
    ("docs/AI_AUTOMATION_INTEGRATION.md",     "AI Automation Integration"),
    ("docs/docs/AI_AUTOMATION_SERVICE.md",    "AI Automation Service"),

    # ── Quantum Engines ───────────────────────────────────
    ("quantum_service/README.md",             "Quantum Service"),
    ("quantum_engines/qiskit/README.md",      "Qiskit Engine"),
    ("quantum_engines/pennylane/README.md",   "PennyLane Engine"),
    ("quantum_engines/pyquil/README.md",      "PyQuil Engine"),
    ("quantum_engines/qutip/README.md",       "QuTiP Engine"),

    # ── Hardware Integration ──────────────────────────────
    ("atonix-hardware-integration/README.md",       "Hardware Integration Overview"),
    ("atonix-hardware-integration/docs/ARCHITECTURE.md", "Hardware Architecture"),
    ("atonix-hardware-integration/docs/SETUP.md",        "Hardware Setup"),
    ("atonix-hardware-integration/docs/API.md",          "Hardware API"),
    ("atonix-hardware-integration/docs/DEPLOYMENT.md",   "Hardware Deployment"),
    ("atonix-hardware-integration/docs/TROUBLESHOOTING.md","Hardware Troubleshooting"),
    ("docs/PCIe_Expansion_Guide.md",          "PCIe Expansion Guide"),

    # ── Terraform / IaC ───────────────────────────────────
    ("terraform/kubernetes/README.md",        "Terraform Kubernetes"),
    ("terraform/modules/README.md",           "Terraform Modules"),

    # ── Infrastructure Tools ──────────────────────────────
    ("infrastructure/puppet/README.md",       "Puppet Configuration"),
    ("infrastructure/concourse/k8s/README.md","Concourse CI on Kubernetes"),
    ("scripts/README-nerdctl.md",             "Nerdctl Scripts"),
    ("docs/cert-manager-dns01-templates.md",  "Cert-Manager DNS01 Templates"),

    # ── Services ─────────────────────────────────────────
    ("ruby_service/README.md",                "Ruby Service"),

    # ── Troubleshooting ───────────────────────────────────
    ("TROUBLESHOOTING.md",                    "Troubleshooting Guide"),
]

# ──────────────────────────────────────────────────────────
#  Pandoc LaTeX template settings (passed as metadata)
# ──────────────────────────────────────────────────────────
PANDOC_METADATA = """---
title: "AtonixCorp Platform -- Complete Project Manual"
subtitle: "Infrastructure -- Deployment -- Security -- Development -- Operations"
author: "AtonixCorp Engineering Team"
date: "2026"
lang: en
toc: true
toc-depth: 3
numbersections: true
colorlinks: true
linkcolor: "blue"
urlcolor: "blue"
geometry: "margin=2.5cm"
fontsize: 10pt
linestretch: 1.25
header-includes: |
  \\usepackage{fancyhdr}
  \\pagestyle{fancy}
  \\fancyhead[L]{\\textbf{AtonixCorp Platform Manual}}
  \\fancyhead[R]{\\thepage}
  \\fancyfoot[C]{\\footnotesize AtonixCorp Engineering -- Confidential -- 2026}
  \\fancyfoot[R]{\\footnotesize atonixcorp.com}
  \\renewcommand{\\headrulewidth}{0.4pt}
  \\renewcommand{\\footrulewidth}{0.4pt}
---

"""

def clean_md(text: str, section_title: str) -> str:
    """Clean unicode issues and demote headings under a top-level section."""
    # Common typographic replacements
    replacements = {
        '\ufffd': '',   # replacement char
        '\u2019': "'", '\u2018': "'",
        '\u201c': '"', '\u201d': '"',
        '\u2013': '--', '\u2014': '---',
        '\u00b7': '*',  '\u2022': '-',
        '\u2026': '...', '\u00a9': '(C)', '\u00ae': '(R)',
        '\u2122': '(TM)', '\u00b0': 'deg',
        '\u2192': '->', '\u2190': '<-', '\u2194': '<->',
        '\u21d2': '=>',  '\u21d0': '<=',
        '\u2764': '<3',  '\u2665': '<3',
        '\u2714': '[x]', '\u2716': '[X]', '\u2718': '[X]',
        '\u2705': '[OK]', '\u274c': '[NO]',
        '\u2610': '[ ]', '\u2611': '[x]',
        '\u25b6': '>',   '\u25c0': '<',
        '\u25cf': '-',   '\u25cb': 'o',
        '\u2500': '-',   '\u2502': '|',
        '\u250c': '+',   '\u2510': '+',
        '\u2514': '+',   '\u2518': '+',
        '\u251c': '+',   '\u2524': '+',
        '\u252c': '+',   '\u2534': '+',
        '\u253c': '+',
        '\u2550': '=',   '\u2551': '|',
        '\u2554': '+',   '\u2557': '+',
        '\u255a': '+',   '\u255d': '+',
        '\u2560': '+',   '\u2563': '+',
        '\u2566': '+',   '\u2569': '+',
        '\u256c': '+',
        '\u00e9': 'e',   '\u00e8': 'e',  '\u00ea': 'e',
        '\u00e0': 'a',   '\u00e2': 'a',  '\u00e4': 'a',
        '\u00fc': 'u',   '\u00f6': 'o',  '\u00f3': 'o',
        '\u00ed': 'i',   '\u00fa': 'u',  '\u00f1': 'n',
        '\u00c9': 'E',   '\u00c0': 'A',  '\u00c4': 'A',
        '\u00dc': 'U',   '\u00d6': 'O',
    }
    for char, rep in replacements.items():
        text = text.replace(char, rep)
    # Strip any remaining non-ASCII (> 0x7F) characters that pdflatex can't handle
    text = re.sub(r'[^\x00-\x7F]', '', text)
    # Escape stray LaTeX math delimiters that appear literally in the docs
    text = re.sub(r'\\\(', '(', text)
    text = re.sub(r'\\\)', ')', text)
    text = re.sub(r'\\\[', '[', text)
    text = re.sub(r'\\\]', ']', text)
    # Demote all existing headings by one level so they nest under the section H1
    separator = f"\n\n---\n\n# {section_title}\n\n"
    lines = []
    for line in text.splitlines():
        if line.startswith("#"):
            line = "#" + line
        lines.append(line)
    return separator + "\n".join(lines) + "\n"


def build_merged():
    parts = [PANDOC_METADATA]
    seen  = set()

    for rel_path, title in ORDERED:
        fp = DOCSS / rel_path
        if str(fp) in seen:
            continue
        seen.add(str(fp))
        if not fp.exists():
            print(f"  [skip] {rel_path} (not found)")
            continue
        content = fp.read_text(errors="replace").strip()
        if not content:
            continue
        print(f"  [add]  {rel_path}")
        parts.append(clean_md(content, title))

    # Catch-all: include any .md not already covered
    all_md = sorted(DOCSS.rglob("*.md"))
    for fp in all_md:
        if str(fp) in seen or fp.name == "_merged.md" or fp.name == "build_manual.py":
            continue
        content = fp.read_text(errors="replace").strip()
        if not content:
            continue
        rel = fp.relative_to(DOCSS)
        title = fp.stem.replace("_", " ").replace("-", " ").title()
        print(f"  [add]  {rel} (catch-all)")
        parts.append(clean_md(content, title))
        seen.add(str(fp))

    MERGED.write_text("\n".join(parts))
    print(f"\nMerged markdown written: {MERGED}")


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "pandoc",
        str(MERGED),
        "--pdf-engine=pdflatex",
        "--standalone",
        f"--output={OUTPUT}",
        "--highlight-style=tango",
        "--from=markdown-tex_math_dollars-tex_math_single_backslash",
        "--variable", "classoption=oneside",
        "--variable", "papersize=a4",
    ]
    print(f"\nRunning pandoc...\n  {' '.join(cmd)}\n")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("STDERR:", result.stderr[-3000:])
        sys.exit(result.returncode)
    print(f"\n✅  PDF generated: {OUTPUT}")
    size_kb = OUTPUT.stat().st_size // 1024
    print(f"    Size: {size_kb} KB")


def cleanup():
    if MERGED.exists():
        MERGED.unlink()
        print("Cleaned up temporary merged file.")


if __name__ == "__main__":
    print("=== AtonixCorp Manual PDF Builder ===\n")
    print("Assembling markdown files...")
    build_merged()
    build_pdf()
    cleanup()
    print("\nDone. PDF is at:  assets/AtonixCorp_Manual.pdf")
