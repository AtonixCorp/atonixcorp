#!/usr/bin/env python3
"""
Example usage of the PyQuil client implementation.

This script demonstrates various quantum programs that can be executed
using the PyQuil client.
"""

# Add backend to path for imports
import sys
import os
backend_path = os.path.join(os.path.dirname(__file__), '..', '..', 'backend')
sys.path.insert(0, backend_path)

from core.quantum_engines import pyquil_client


def example_superposition():
    """Create a superposition state using Hadamard gate."""
    print("=" * 60)
    print("Example 1: Superposition (Hadamard Gate)")
    print("=" * 60)
    
    program = """
    # Apply Hadamard gate to create superposition
    H 0
    """
    
    print(f"Program:\n{program}")
    
    try:
        result = pyquil_client.submit(program, shots=100)
        print(f"\nResult: {result}")
        print("\nExpected: Approximately equal counts for |0⟩ and |1⟩")
    except Exception as e:
        print(f"Error: {e}")
        print("Note: Install PyQuil and start QVM to run this example")


def example_bell_state():
    """Create a Bell state (maximally entangled pair)."""
    print("\n" + "=" * 60)
    print("Example 2: Bell State (Entanglement)")
    print("=" * 60)
    
    program = """
    # Create superposition on first qubit
    H 0
    # Entangle first and second qubit
    CNOT 0 1
    """
    
    print(f"Program:\n{program}")
    
    try:
        result = pyquil_client.submit(program, shots=100)
        print(f"\nResult: {result}")
        print("\nExpected: Only |00⟩ and |11⟩ states (no |01⟩ or |10⟩)")
    except Exception as e:
        print(f"Error: {e}")
        print("Note: Install PyQuil and start QVM to run this example")


def example_pauli_gates():
    """Demonstrate Pauli gates (X, Y, Z)."""
    print("\n" + "=" * 60)
    print("Example 3: Pauli Gates")
    print("=" * 60)
    
    program = """
    # X gate flips |0⟩ to |1⟩
    X 0
    # Y gate applies phase and flip
    Y 1
    # Z gate applies phase flip
    Z 2
    """
    
    print(f"Program:\n{program}")
    
    try:
        result = pyquil_client.submit(program, shots=100)
        print(f"\nResult: {result}")
        print("\nNote: X gate should give |1⟩ for qubit 0")
    except Exception as e:
        print(f"Error: {e}")
        print("Note: Install PyQuil and start QVM to run this example")


def example_rotation_gates():
    """Demonstrate rotation gates (RX, RY, RZ)."""
    print("\n" + "=" * 60)
    print("Example 4: Rotation Gates")
    print("=" * 60)
    
    import math
    pi = math.pi
    
    program = f"""
    # RX(π/2) creates superposition
    RX({pi/2}) 0
    # RY(π) is like X gate
    RY({pi}) 1
    # RZ(π/4) applies phase
    RZ({pi/4}) 2
    """
    
    print(f"Program:\n{program}")
    
    try:
        result = pyquil_client.submit(program, shots=100)
        print(f"\nResult: {result}")
        print("\nNote: RX(π/2) creates superposition like Hadamard")
    except Exception as e:
        print(f"Error: {e}")
        print("Note: Install PyQuil and start QVM to run this example")


def example_ghz_state():
    """Create a 3-qubit GHZ state (generalized Bell state)."""
    print("\n" + "=" * 60)
    print("Example 5: GHZ State (3-qubit entanglement)")
    print("=" * 60)
    
    program = """
    # Create GHZ state: (|000⟩ + |111⟩) / √2
    H 0
    CNOT 0 1
    CNOT 1 2
    """
    
    print(f"Program:\n{program}")
    
    try:
        result = pyquil_client.submit(program, shots=100)
        print(f"\nResult: {result}")
        print("\nExpected: Only |000⟩ and |111⟩ states")
    except Exception as e:
        print(f"Error: {e}")
        print("Note: Install PyQuil and start QVM to run this example")


def main():
    """Run all examples."""
    print("\nPyQuil Client Implementation Examples")
    print("=" * 60)
    print("These examples demonstrate various quantum programs.")
    print("To run them, install PyQuil and start QVM:")
    print("  pip install pyquil")
    print("  qvm -S")
    print("=" * 60)
    
    example_superposition()
    example_bell_state()
    example_pauli_gates()
    example_rotation_gates()
    example_ghz_state()
    
    print("\n" + "=" * 60)
    print("Examples complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
