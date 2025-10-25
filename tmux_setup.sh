#!/bin/bash
# HTB Helper - Tmux Session Setup Script
# Creates a comprehensive tmux session for penetration testing workflow

SESSION_NAME="htb-${1:-default}"
MACHINE_NAME="${1:-machine}"

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "Error: tmux is not installed. Please install it first."
    echo "  Ubuntu/Debian: sudo apt-get install tmux"
    echo "  Arch: sudo pacman -S tmux"
    exit 1
fi

# Check if session already exists
tmux has-session -t "$SESSION_NAME" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Session '$SESSION_NAME' already exists. Attaching..."
    tmux attach-session -t "$SESSION_NAME"
    exit 0
fi

echo "Creating new tmux session: $SESSION_NAME"

# Create new session with first window (main)
tmux new-session -d -s "$SESSION_NAME" -n "main"

# Window 0: Main window - for running htb-helper and general commands
tmux send-keys -t "$SESSION_NAME:0" "echo 'HTB Helper - Main Window'" C-m
tmux send-keys -t "$SESSION_NAME:0" "echo 'Run: python3 main.py to start HTB Helper'" C-m

# Window 1: Nmap/Scanning
tmux new-window -t "$SESSION_NAME:1" -n "nmap"
tmux send-keys -t "$SESSION_NAME:1" "echo 'Nmap/Scanning Window'" C-m
tmux send-keys -t "$SESSION_NAME:1" "# Run nmap scans here" C-m

# Window 2: Web enumeration (split into multiple panes)
tmux new-window -t "$SESSION_NAME:2" -n "web"
tmux send-keys -t "$SESSION_NAME:2" "echo 'Web Enumeration Window - Main Pane'" C-m

# Split horizontally for gobuster/ffuf
tmux split-window -h -t "$SESSION_NAME:2"
tmux send-keys -t "$SESSION_NAME:2.1" "echo 'Directory Fuzzing Pane (gobuster/ffuf)'" C-m

# Split the right pane vertically for nikto/whatweb
tmux split-window -v -t "$SESSION_NAME:2.1"
tmux send-keys -t "$SESSION_NAME:2.2" "echo 'Web Scanner Pane (nikto/whatweb)'" C-m

# Window 3: Shells/Listeners
tmux new-window -t "$SESSION_NAME:3" -n "shells"
tmux send-keys -t "$SESSION_NAME:3" "echo 'Shells/Listeners Window'" C-m
tmux send-keys -t "$SESSION_NAME:3" "# Start listeners here (nc -lvnp 4444)" C-m

# Window 4: Exploitation
tmux new-window -t "$SESSION_NAME:4" -n "exploit"
tmux send-keys -t "$SESSION_NAME:4" "echo 'Exploitation Window'" C-m
tmux send-keys -t "$SESSION_NAME:4" "# Run exploits and payloads here" C-m

# Window 5: Notes/Documentation (split for editor and viewing)
tmux new-window -t "$SESSION_NAME:5" -n "notes"
tmux send-keys -t "$SESSION_NAME:5" "echo 'Notes Window - Editor Pane'" C-m
if [ -d "htb/$MACHINE_NAME/notes" ]; then
    tmux send-keys -t "$SESSION_NAME:5" "cd htb/$MACHINE_NAME/notes" C-m
fi

# Split for viewing/monitoring notes
tmux split-window -v -t "$SESSION_NAME:5" -p 30
tmux send-keys -t "$SESSION_NAME:5.1" "echo 'Notes Viewing Pane'" C-m

# Window 6: Privilege Escalation
tmux new-window -t "$SESSION_NAME:6" -n "privesc"
tmux send-keys -t "$SESSION_NAME:6" "echo 'Privilege Escalation Window'" C-m
tmux send-keys -t "$SESSION_NAME:6" "# Run LinPEAS/WinPEAS here" C-m

# Window 7: Monitoring/Logs
tmux new-window -t "$SESSION_NAME:7" -n "monitor"
tmux send-keys -t "$SESSION_NAME:7" "echo 'Monitoring/Logs Window'" C-m

# Set default window to main
tmux select-window -t "$SESSION_NAME:0"

echo "Tmux session '$SESSION_NAME' created successfully!"
echo ""
echo "Windows created:"
echo "  0: main      - Main HTB Helper window"
echo "  1: nmap      - Network scanning"
echo "  2: web       - Web enumeration (3 panes)"
echo "  3: shells    - Shells and listeners"
echo "  4: exploit   - Exploitation"
echo "  5: notes     - Notes and documentation"
echo "  6: privesc   - Privilege escalation"
echo "  7: monitor   - Monitoring and logs"
echo ""
echo "Attaching to session..."
echo ""
echo "Tmux shortcuts:"
echo "  Ctrl+b n     - Next window"
echo "  Ctrl+b p     - Previous window"
echo "  Ctrl+b [0-7] - Go to window number"
echo "  Ctrl+b arrow - Switch between panes"
echo "  Ctrl+b d     - Detach from session"
echo "  Ctrl+b ?     - Help"
echo ""

# Attach to the session
tmux attach-session -t "$SESSION_NAME"
