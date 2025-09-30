````markdown
# QuTiP engine scaffold (demo)

Purpose
-------
QuTiP (Quantum Toolbox in Python) is a mature, simulation-focused library for modeling open quantum systems, quantum dynamics, and quantum optics. It is optimized for solving master equations, Lindblad dynamics, and exploring decoherence and dissipation. QuTiP is not designed for gate-level hardware execution (no cloud/hardware backends). Use this engine when you need high-quality physics simulations rather than circuit execution on real quantum processors.

Stack highlights
----------------
- Core: NumPy, SciPy, Cython — heavy numerical linear algebra and differential equation solvers.
- Focus: time-dependent Hamiltonians, Lindblad master equations, collapse operators, quantum trajectories, and quantum-optics observables.
- No hardware integration: QuTiP works purely in software; it provides tools for simulation and analysis only.

Best for
--------
- Researchers and engineers modeling open quantum systems (decoherence, dissipation).
- Simulating quantum optics setups, driven-dissipative systems, and master-equation dynamics.
- Generating high-accuracy reference simulations for validating gate-level or noisy-device experiments.

Installation
------------
Prefer installing into a virtualenv. QuTiP has compiled Cython extensions; on many systems installing from PyPI works, but on some platforms you may need a C compiler and SciPy/NumPy prebuilt wheels.

Recommended (Linux/macOS):

```bash
python -m venv .venv-qutip
source .venv-qutip/bin/activate
pip install --upgrade pip setuptools wheel
pip install qutip
```

If you need a specific version (pin in your environment):

```bash
pip install qutip==5.3.0  # example pinned version
```

Quickstart examples
-------------------
Below are minimal examples to get started. Save each as a small script and run inside the virtualenv above.

1) Rabi oscillation (closed system):

```python
from qutip import basis, sigmax, sigmaz, mesolve, expect
import numpy as np

# Pauli matrices
sx = sigmax()
sz = sigmaz()

# Hamiltonian: simple drive on sigma_x
H = 0.5 * sx

# Initial state |0>
psi0 = basis(2, 0)

tlist = np.linspace(0, 10, 200)

result = mesolve(H, psi0, tlist, [], [sz])
expect_z = result.expect[0]
print('Expectation <sz> first 5:', expect_z[:5])
```

2) Lindblad master equation (single qubit with relaxation):

```python
from qutip import mesolve, basis, destroy, sigmaz
import numpy as np

g = 0.1  # relaxation rate

H = 0.5 * sigmaz()
psi0 = basis(2, 1)  # |1> excited

c_ops = [np.sqrt(g) * destroy(2)]  # collapse operator (relaxation)
tlist = np.linspace(0, 50, 500)

result = mesolve(H, psi0, tlist, c_ops, [sigmaz()])
print('Done; last expectation:', result.expect[0][-1])
```

3) Quantum trajectory (stochastic unraveling):

```python
from qutip import mcsolve, basis, sigmaz
import numpy as np

H = 0.5 * sigmaz()
psi0 = basis(2, 1)

c_ops = []
tlist = np.linspace(0, 25, 250)

result = mcsolve(H, psi0, tlist, c_ops, [sigmaz()], ntraj=50)
print('Trajectories run:', len(result.states))
```

Integration notes for this project
---------------------------------
- Use QuTiP for server-side simulation tasks only. It is CPU-bound and may require batching or background workers (Celery) for long runs.
- Provide a clean API contract for simulation jobs: input (Hamiltonian, collapse operators, initial state, tlist), output (time-series expectations, states, or diagnostics). Use JSON-friendly serializations (numpy arrays → lists or base64-encoded binary) and limit the size of returned wavefunction/state payloads.
- For heavy simulations, spawn jobs into workers (Celery/RQ) and store results in persistent storage (S3/MinIO or DB blobs). Provide status endpoints for polling.
- Decide and document numeric tolerances, solver options (ode45 vs. implicit solvers), and maximum time/space limits to avoid DoS via expensive simulations.

Testing recommendations
-----------------------
- Unit tests: small deterministic runs with tiny Hilbert spaces (2–4 levels) and compare results to analytical expectations when possible.
- Performance tests: measure runtime for common configurations and add rate-limiting/queueing if tasks are expensive.
- Reproducibility: set random seeds when using stochastic solvers (`mcsolve`) and document nondeterministic behavior.

What we provide in this scaffold
--------------------------------
- A minimal README (this file) and a placeholder backend wrapper (`backend/core/quantum_engines/qutip_client.py`) that should expose a `simulate(payload)` function which:
  - validates user input
  - converts JSON payload into QuTiP objects
  - runs the solver (sync or via background worker)
  - stores results and returns a job id / result URL

Next steps
----------
- Implement `qutip_client.py` with input validation, small example handlers (Rabi/Lindblad), and integration with the project's job queue.
- Add example API endpoints in Django that enqueue simulation jobs and return job IDs.
- Add front-end UI to submit simulation jobs and visualize time-series results (plots).

References
----------
- QuTiP docs: https://qutip.org/docs/latest/
- QuTiP GitHub: https://github.com/qutip/qutip

````# QuTiP engine scaffold (demo)

This folder contains a small scaffold for integrating QuTiP (quantum toolbox in Python).

Install dependencies (dev):

```bash
pip install qutip
```

QuTiP is generally used for quantum dynamics and simulation; implement programmatic wrappers as needed.
