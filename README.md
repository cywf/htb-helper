# HTB-Helper

A comprehensive tool designed to assist penetration testers and security enthusiasts in their Hack The Box (HTB) challenges. htb-helper streamlines the initial phases of a penetration test by automating common tasks such as Nmap scanning, payload generation, and error handling.

## Features

* **User Input Collection**: Gather essential details like machine name, IP, and type with validation
* **Directory Structure Setup**: Organize your penetration testing assets for each machine
* **Tool Installation**: Ensure necessary tools like Nmap are installed and ready to use
* **Nmap Scanning**: Perform various levels of Nmap scans based on user preference
* **Advanced Nmap Scripts**: Run vulnerability-specific Nmap scripts based on the target machine type
* **Payload Generation**: Automatically generate multiple payloads using msfvenom for different target types
* **Error Handling**: Enhanced logging with timestamps, colors, and visual progress indicators
* **Tmux Integration**: Built-in tmux session setup for organized CTF workflow
* **CTF Scripts**: Collection of helper scripts for reverse shells, web fuzzing, and enumeration
* **CLI Support**: Both interactive and non-interactive modes with full argument support
* **Configuration**: YAML-based configuration file support

## Quick Start

### Installation

Clone the repository:
```bash
git clone https://github.com/cywf/htb-helper.git
cd htb-helper
```

Install dependencies:
```bash
pip3 install -r requirements.txt
```

### Basic Usage

#### Interactive Mode (Recommended for first-time users)
```bash
python3 main.py
```

#### CLI Mode (Non-interactive)
```bash
# Full setup with all options
python3 cli.py -n MyBox -i 10.10.10.150 -t Linux -l 10.10.14.5

# Quick scan only
python3 cli.py -n MyBox -i 10.10.10.150 --only-scan

# Skip tool installation
python3 cli.py -n MyBox -i 10.10.10.150 --skip-tools
```

#### With Tmux Session
```bash
# Create organized tmux session for your machine
./tmux_setup.sh MyMachineName

# Then run htb-helper in the main window
python3 main.py
```

## Directory Structure

```
htb-helper/
├── main.py                  # Main script (interactive mode)
├── cli.py                   # CLI interface (non-interactive mode)
├── setup.py                 # User input and directory setup
├── nmap_payload_gen.py      # Nmap scanning and payload generation
├── tools.py                 # Tool installation functions
├── error_handling.py        # Error logging and visual feedback
├── config.py                # Configuration management
├── tmux_setup.sh            # Tmux session setup script
├── ctf_scripts/             # CTF helper scripts
│   ├── revshell_gen.py      # Reverse shell payload generator
│   ├── web_fuzz.sh          # Web fuzzing automation
│   ├── quick_enum.sh        # Quick Linux enumeration
│   └── README.md            # CTF scripts documentation
├── networking/              # Networking resources and guides
├── systems/                 # OS-specific guides
│   └── linux/               # Linux privilege escalation
└── web/                     # Web vulnerability resources
```

## CTF Scripts

### Reverse Shell Generator
Generate reverse shell payloads for 18+ languages and environments:
```bash
# Show common shells
python3 ctf_scripts/revshell_gen.py -l 10.10.14.5 -p 4444

# Show all available shells
python3 ctf_scripts/revshell_gen.py -l 10.10.14.5 -p 4444 -a

# Generate specific shell type
python3 ctf_scripts/revshell_gen.py -l 10.10.14.5 -p 4444 -s python3
```

### Web Fuzzing Helper
Automate web enumeration with gobuster, ffuf, nikto, etc.:
```bash
# Full web enumeration
./ctf_scripts/web_fuzz.sh -u http://target.com -a

# Directory fuzzing only
./ctf_scripts/web_fuzz.sh -u http://target.com --dirs -e php,html,js
```

### Quick Enumeration
Run on target after getting a shell:
```bash
bash ctf_scripts/quick_enum.sh
```

## Configuration

Create a configuration file for persistent settings:

```bash
# Generate example config
python3 -c "from config import Config; Config().create_example_config()"

# Copy and customize
cp htb_helper.example.yaml htb_helper.yaml
# Edit htb_helper.yaml with your preferences
```

Configuration locations (in order of precedence):
1. `htb_helper.yaml` (current directory)
2. `~/.htb_helper.yaml`
3. `~/.config/htb_helper/config.yaml`

## CLI Arguments

```
Options:
  -n, --name NAME           Machine name
  -i, --ip IP              Target machine IP
  -t, --type TYPE          Machine type (Windows/Linux)
  -l, --lhost IP           Your IP for payloads (LHOST)
  -p, --lport PORT         Listening port (default: 4444)
  -H, --handle HANDLE      Your username/handle
  
  --skip-tools             Skip tool installation
  --skip-scan              Skip nmap scanning
  --skip-payloads          Skip payload generation
  --only-scan              Only run nmap scans
  --only-payloads          Only generate payloads
  -I, --interactive        Force interactive mode
```

## Tmux Workflow

The tmux setup creates an organized workspace with multiple windows:

- **Window 0 (main)**: Main HTB Helper interface
- **Window 1 (nmap)**: Network scanning
- **Window 2 (web)**: Web enumeration (3 panes)
- **Window 3 (shells)**: Shells and listeners
- **Window 4 (exploit)**: Exploitation work
- **Window 5 (notes)**: Documentation (2 panes)
- **Window 6 (privesc)**: Privilege escalation
- **Window 7 (monitor)**: Monitoring and logs

Navigate with `Ctrl+b` followed by window number (0-7).

## Requirements

- **Python 3.x** (3.7+)
- **Nmap**
- **Msfvenom** (from Metasploit Framework)
- **Git**

Optional tools for enhanced functionality:
- tmux
- gobuster / ffuf
- nikto
- subfinder / assetfinder

## Examples

### Complete workflow
```bash
# 1. Create tmux session
./tmux_setup.sh MyBox

# 2. Run HTB Helper (in tmux window 0)
python3 cli.py -n MyBox -i 10.10.10.150 -l 10.10.14.5

# 3. Start listener (in tmux window 3)
nc -lvnp 4444

# 4. Run web enumeration (in tmux window 2)
./ctf_scripts/web_fuzz.sh -u http://10.10.10.150 -a

# 5. Generate reverse shells as needed
python3 ctf_scripts/revshell_gen.py -l 10.10.14.5 -p 4444 -s bash-tcp
```

### Non-interactive automation
```bash
# Complete setup in one command
python3 cli.py \
  -n AutoBox \
  -i 10.10.10.200 \
  -t Linux \
  -l 10.10.14.5 \
  -p 4444 \
  -H myhandle

# Results will be in htb/AutoBox/
```

### Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### License

The HTB-Helper tool is licensed under the [MIT](https://github.com/cywf/htb-helper/LICENSE), because we believe in open-source software and the free dissemination of knowledge.

