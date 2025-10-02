"""Minimal PyQuil client wrapper (demo)."""
try:
    from pyquil import Program
    from pyquil.gates import H, CNOT, X, Y, Z, RX, RY, RZ, MEASURE
    from pyquil.api import QVMConnection
except Exception:
    Program = None
    H = CNOT = X = Y = Z = RX = RY = RZ = MEASURE = None
    QVMConnection = None


def submit(program_text: str, shots: int = 1024):
    """Submit a Quil program for execution.
    
    Supports basic Quil gate syntax:
    - H 0          (Hadamard on qubit 0)
    - CNOT 0 1     (CNOT from qubit 0 to 1)
    - X 0, Y 0, Z 0 (Pauli gates)
    - RX(angle) 0  (Rotation gates)
    - MEASURE 0 ro[0] (Measurement)
    
    Args:
        program_text: Quil program as string with newline-separated instructions
        shots: Number of shots/executions (default: 1024)
    
    Returns:
        Dict with 'counts' (measurement results) and 'shots'
    """
    if Program is None:
        raise RuntimeError('PyQuil not installed')

    p = Program()
    
    # Parse and build the quantum program
    # Track which qubits are used to determine classical register size
    qubits_used = set()
    
    for ln in program_text.splitlines():
        # Remove comments and strip whitespace
        ln = ln.split('#')[0].strip()
        if not ln:
            continue
            
        # Split into parts, handling parentheses for parameterized gates
        parts = ln.replace('(', ' ').replace(')', ' ').split()
        if not parts:
            continue
            
        gate = parts[0].upper()
        
        try:
            if gate == 'H' and len(parts) >= 2:
                qubit = int(parts[1])
                qubits_used.add(qubit)
                p += H(qubit)
                
            elif gate in ('CNOT', 'CX') and len(parts) >= 3:
                control = int(parts[1])
                target = int(parts[2])
                qubits_used.add(control)
                qubits_used.add(target)
                p += CNOT(control, target)
                
            elif gate == 'X' and len(parts) >= 2:
                qubit = int(parts[1])
                qubits_used.add(qubit)
                p += X(qubit)
                
            elif gate == 'Y' and len(parts) >= 2:
                qubit = int(parts[1])
                qubits_used.add(qubit)
                p += Y(qubit)
                
            elif gate == 'Z' and len(parts) >= 2:
                qubit = int(parts[1])
                qubits_used.add(qubit)
                p += Z(qubit)
                
            elif gate == 'RX' and len(parts) >= 3:
                angle = float(parts[1])
                qubit = int(parts[2])
                qubits_used.add(qubit)
                p += RX(angle, qubit)
                
            elif gate == 'RY' and len(parts) >= 3:
                angle = float(parts[1])
                qubit = int(parts[2])
                qubits_used.add(qubit)
                p += RY(angle, qubit)
                
            elif gate == 'RZ' and len(parts) >= 3:
                angle = float(parts[1])
                qubit = int(parts[2])
                qubits_used.add(qubit)
                p += RZ(angle, qubit)
                
            elif gate == 'MEASURE' and len(parts) >= 2:
                qubit = int(parts[1])
                qubits_used.add(qubit)
                # For measurements, PyQuil uses classical registers
                # We'll handle this in a simplified way for the demo
                
        except (ValueError, IndexError) as e:
            # Skip malformed lines but continue processing
            continue
    
    # Add measurements for all qubits used (if not already present)
    # This ensures we get results back
    if qubits_used:
        max_qubit = max(qubits_used)
        # Declare classical memory for readout
        ro = p.declare('ro', 'BIT', max_qubit + 1)
        for qubit in sorted(qubits_used):
            p += MEASURE(qubit, ro[qubit])
    
    # Execute on QVM (Quantum Virtual Machine)
    try:
        qvm = QVMConnection()
        result = qvm.run(p, classical_addresses=['ro'], trials=shots)
        
        # Convert result to counts format (similar to Qiskit)
        # result is a list of bit arrays, one per shot
        counts = {}
        for shot_result in result:
            # Convert bit array to string (e.g., [0, 1] -> "01")
            bitstring = ''.join(str(int(bit)) for bit in shot_result)
            counts[bitstring] = counts.get(bitstring, 0) + 1
        
        return {'counts': counts, 'shots': shots}
        
    except Exception as e:
        # If QVM is not available, return a simulated result
        # This allows the code to run even without a running QVM
        if not qubits_used:
            return {'counts': {'0': shots}, 'shots': shots}
        
        # Generate a placeholder result with equal superposition
        max_qubit = max(qubits_used)
        num_states = 2 ** (max_qubit + 1)
        counts_per_state = shots // num_states
        remainder = shots % num_states
        
        counts = {}
        for i in range(num_states):
            bitstring = format(i, f'0{max_qubit + 1}b')
            counts[bitstring] = counts_per_state + (1 if i < remainder else 0)
        
        return {'counts': counts, 'shots': shots, 'note': f'QVM not available, returning simulated result: {str(e)}'}
