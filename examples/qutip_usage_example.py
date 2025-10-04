#!/usr/bin/env python3
"""
Example usage of the QuTiP quantum engine.

This script demonstrates how to use the QuTiP client to run quantum simulations
through the AtonixCorp platform's quantum engine manager.

Requirements:
    - qutip package installed (pip install qutip)
    - numpy package installed (pip install numpy)
"""

import json
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.core.quantum_engines.manager import submit as manager_submit
from backend.core.quantum_engines.qutip_client import submit as qutip_submit


def example_rabi_oscillation():
    """Example: Rabi oscillation simulation."""
    print("="*60)
    print("Example 1: Rabi Oscillation")
    print("="*60)
    
    # Define the simulation payload
    simulation = {
        "type": "rabi",
        "tlist": [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]
    }
    
    print(f"Simulation payload: {json.dumps(simulation, indent=2)}")
    
    try:
        # Submit via the quantum engine manager
        result = manager_submit('qutip', {
            'description': json.dumps(simulation),
            'shots': 1024
        })
        
        print(f"\nResult status: {result.get('status')}")
        if result.get('status') == 'ok':
            print(f"Expectation values <σz>: {result.get('expect_sz')}")
        else:
            print(f"Error: {result.get('error')}")
            
    except ImportError as e:
        print(f"\n⚠ QuTiP is not installed: {e}")
        print("Install QuTiP with: pip install qutip")
    except Exception as e:
        print(f"\n✗ Error: {e}")


def example_lindblad_master_equation():
    """Example: Lindblad master equation with relaxation."""
    print("\n" + "="*60)
    print("Example 2: Lindblad Master Equation (with relaxation)")
    print("="*60)
    
    # Define the simulation payload
    simulation = {
        "type": "lindblad",
        "tlist": [0, 5, 10, 15, 20, 25, 30],
        "g": 0.2  # relaxation rate
    }
    
    print(f"Simulation payload: {json.dumps(simulation, indent=2)}")
    
    try:
        # Submit directly via qutip_client
        result = qutip_submit(simulation)  # Can also pass dict directly
        
        print(f"\nResult status: {result.get('status')}")
        if result.get('status') == 'ok':
            print(f"Expectation values <σz>: {result.get('expect_sz')}")
        else:
            print(f"Error: {result.get('error')}")
            
    except ImportError as e:
        print(f"\n⚠ QuTiP is not installed: {e}")
        print("Install QuTiP with: pip install qutip")
    except Exception as e:
        print(f"\n✗ Error: {e}")


def example_error_handling():
    """Example: Error handling."""
    print("\n" + "="*60)
    print("Example 3: Error Handling")
    print("="*60)
    
    # Example 3a: Invalid JSON
    print("\n3a. Invalid JSON:")
    result = qutip_submit("not valid json")
    print(f"Result: {result}")
    
    # Example 3b: Missing required parameter
    print("\n3b. Missing required parameter (tlist):")
    try:
        result = qutip_submit(json.dumps({"type": "rabi"}))
        print(f"Result: {result}")
    except ImportError as e:
        print(f"⚠ QuTiP not installed (would return error: 'tlist is required')")
    
    # Example 3c: Unknown simulation type
    print("\n3c. Unknown simulation type:")
    try:
        result = qutip_submit(json.dumps({
            "type": "unknown_type",
            "tlist": [0, 1, 2]
        }))
        print(f"Result: {result}")
    except ImportError as e:
        print(f"⚠ QuTiP not installed (would return error: 'Unknown simulation type')")


def main():
    """Run all examples."""
    print("\nQuTiP Quantum Engine - Usage Examples")
    print("=" * 60)
    
    example_rabi_oscillation()
    example_lindblad_master_equation()
    example_error_handling()
    
    print("\n" + "="*60)
    print("Examples completed!")
    print("="*60)


if __name__ == "__main__":
    main()
