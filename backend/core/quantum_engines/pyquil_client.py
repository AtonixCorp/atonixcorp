"""Minimal PyQuil client wrapper (demo)."""
try:
    from pyquil import Program
    from pyquil.api import local_qvm
except Exception:
    Program = None


def submit(program_text: str, shots: int = 1024):
    if Program is None:
        raise RuntimeError('PyQuil not installed')

    p = Program()
    # Naive: expect lines like 'H 0' or 'CNOT 0 1'
    for ln in program_text.splitlines():
        parts = ln.strip().split()
        if not parts:
            continue
        # This is a stub: a full PyQuil parser would be needed for real workloads
        pass

    qvm = local_qvm()
    # This is placeholder: implement actual execution via QVM or Rigetti cloud
    return {'counts': {}, 'shots': shots}
