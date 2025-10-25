#!/bin/bash
# Web Fuzzing Helper Script
# Automates common web enumeration tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   Web Fuzzing Helper Script${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

print_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    -u, --url URL           Target URL (required)
    -w, --wordlist PATH     Custom wordlist path
    -e, --extensions EXT    File extensions (e.g., php,html,txt)
    -t, --threads NUM       Number of threads (default: 50)
    -o, --output DIR        Output directory (default: ./web_enum)
    -a, --all               Run all enumeration types
    --dirs                  Directory fuzzing only
    --vhosts                Virtual host fuzzing
    --params                Parameter fuzzing
    --subdomains            Subdomain enumeration
    -h, --help              Show this help message

Examples:
    $0 -u http://example.com -a
    $0 -u http://example.com --dirs -e php,html
    $0 -u http://example.com --vhosts -w /path/to/wordlist.txt

EOF
}

# Default values
URL=""
WORDLIST="/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt"
EXTENSIONS="php,html,txt,js"
THREADS=50
OUTPUT_DIR="./web_enum"
RUN_ALL=false
RUN_DIRS=false
RUN_VHOSTS=false
RUN_PARAMS=false
RUN_SUBDOMAINS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            URL="$2"
            shift 2
            ;;
        -w|--wordlist)
            WORDLIST="$2"
            shift 2
            ;;
        -e|--extensions)
            EXTENSIONS="$2"
            shift 2
            ;;
        -t|--threads)
            THREADS="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -a|--all)
            RUN_ALL=true
            shift
            ;;
        --dirs)
            RUN_DIRS=true
            shift
            ;;
        --vhosts)
            RUN_VHOSTS=true
            shift
            ;;
        --params)
            RUN_PARAMS=true
            shift
            ;;
        --subdomains)
            RUN_SUBDOMAINS=true
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

# Validate required arguments
if [ -z "$URL" ]; then
    echo -e "${RED}Error: URL is required${NC}"
    print_usage
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

print_banner

echo -e "${GREEN}Target:${NC} $URL"
echo -e "${GREEN}Output Directory:${NC} $OUTPUT_DIR"
echo -e "${GREEN}Threads:${NC} $THREADS"
echo ""

# Extract domain from URL
DOMAIN=$(echo "$URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')

# Function to run directory fuzzing
run_directory_fuzzing() {
    echo -e "${YELLOW}[*] Starting directory fuzzing...${NC}"
    
    # Check for gobuster
    if command -v gobuster &> /dev/null; then
        echo -e "${BLUE}[+] Using gobuster${NC}"
        gobuster dir -u "$URL" -w "$WORDLIST" -x "$EXTENSIONS" -t "$THREADS" \
            -o "$OUTPUT_DIR/gobuster_dirs.txt" 2>&1 | tee "$OUTPUT_DIR/gobuster_dirs.log"
    elif command -v ffuf &> /dev/null; then
        echo -e "${BLUE}[+] Using ffuf${NC}"
        ffuf -u "$URL/FUZZ" -w "$WORDLIST" -e ".$EXTENSIONS" -t "$THREADS" \
            -o "$OUTPUT_DIR/ffuf_dirs.json" -of json 2>&1 | tee "$OUTPUT_DIR/ffuf_dirs.log"
    else
        echo -e "${RED}[-] No directory fuzzing tool found (gobuster or ffuf)${NC}"
    fi
}

# Function to run vhost fuzzing
run_vhost_fuzzing() {
    echo -e "${YELLOW}[*] Starting virtual host fuzzing...${NC}"
    
    if command -v gobuster &> /dev/null; then
        echo -e "${BLUE}[+] Using gobuster vhost${NC}"
        gobuster vhost -u "$URL" -w "$WORDLIST" -t "$THREADS" \
            -o "$OUTPUT_DIR/gobuster_vhosts.txt" 2>&1 | tee "$OUTPUT_DIR/gobuster_vhosts.log"
    elif command -v ffuf &> /dev/null; then
        echo -e "${BLUE}[+] Using ffuf for vhost fuzzing${NC}"
        ffuf -u "$URL" -H "Host: FUZZ.$DOMAIN" -w "$WORDLIST" -t "$THREADS" \
            -o "$OUTPUT_DIR/ffuf_vhosts.json" -of json 2>&1 | tee "$OUTPUT_DIR/ffuf_vhosts.log"
    else
        echo -e "${RED}[-] No vhost fuzzing tool found${NC}"
    fi
}

# Function to run subdomain enumeration
run_subdomain_enum() {
    echo -e "${YELLOW}[*] Starting subdomain enumeration...${NC}"
    
    if command -v subfinder &> /dev/null; then
        echo -e "${BLUE}[+] Using subfinder${NC}"
        subfinder -d "$DOMAIN" -o "$OUTPUT_DIR/subfinder.txt" 2>&1 | tee "$OUTPUT_DIR/subfinder.log"
    fi
    
    if command -v assetfinder &> /dev/null; then
        echo -e "${BLUE}[+] Using assetfinder${NC}"
        assetfinder --subs-only "$DOMAIN" > "$OUTPUT_DIR/assetfinder.txt"
    fi
    
    if [ ! -f "$OUTPUT_DIR/subfinder.txt" ] && [ ! -f "$OUTPUT_DIR/assetfinder.txt" ]; then
        echo -e "${RED}[-] No subdomain enumeration tool found${NC}"
    fi
}

# Function to run parameter fuzzing
run_parameter_fuzzing() {
    echo -e "${YELLOW}[*] Starting parameter fuzzing...${NC}"
    
    PARAM_WORDLIST="/usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt"
    
    if [ ! -f "$PARAM_WORDLIST" ]; then
        PARAM_WORDLIST="$WORDLIST"
    fi
    
    if command -v ffuf &> /dev/null; then
        echo -e "${BLUE}[+] Using ffuf for GET parameters${NC}"
        ffuf -u "$URL?FUZZ=test" -w "$PARAM_WORDLIST" -t "$THREADS" -mc all -fc 404 \
            -o "$OUTPUT_DIR/ffuf_params.json" -of json 2>&1 | tee "$OUTPUT_DIR/ffuf_params.log"
    else
        echo -e "${RED}[-] ffuf not found for parameter fuzzing${NC}"
    fi
}

# Run nikto scan
run_nikto() {
    echo -e "${YELLOW}[*] Running Nikto scan...${NC}"
    
    if command -v nikto &> /dev/null; then
        nikto -h "$URL" -o "$OUTPUT_DIR/nikto.txt" 2>&1 | tee "$OUTPUT_DIR/nikto.log"
    else
        echo -e "${RED}[-] Nikto not found${NC}"
    fi
}

# Run whatweb
run_whatweb() {
    echo -e "${YELLOW}[*] Running WhatWeb...${NC}"
    
    if command -v whatweb &> /dev/null; then
        whatweb -v -a 3 "$URL" > "$OUTPUT_DIR/whatweb.txt" 2>&1
    else
        echo -e "${RED}[-] WhatWeb not found${NC}"
    fi
}

# Execute based on flags
if [ "$RUN_ALL" = true ]; then
    run_directory_fuzzing
    run_vhost_fuzzing
    run_subdomain_enum
    run_parameter_fuzzing
    run_nikto
    run_whatweb
else
    [ "$RUN_DIRS" = true ] && run_directory_fuzzing
    [ "$RUN_VHOSTS" = true ] && run_vhost_fuzzing
    [ "$RUN_SUBDOMAINS" = true ] && run_subdomain_enum
    [ "$RUN_PARAMS" = true ] && run_parameter_fuzzing
fi

echo ""
echo -e "${GREEN}[+] Enumeration complete!${NC}"
echo -e "${GREEN}[+] Results saved to: $OUTPUT_DIR${NC}"
echo ""
echo -e "${BLUE}Generated files:${NC}"
ls -lh "$OUTPUT_DIR"
