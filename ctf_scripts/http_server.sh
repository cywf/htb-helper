#!/bin/bash
# HTTP Server Helper
# Quick setup for various HTTP servers for file transfers

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

Start various types of HTTP servers for file transfer

Options:
    -p, --port PORT         Port to listen on (default: 8000)
    -d, --directory DIR     Directory to serve (default: current directory)
    -t, --type TYPE         Server type: python|php|ruby|node (default: python)
    -s, --ssl               Enable HTTPS (requires cert.pem and key.pem)
    -u, --upload            Enable file upload (Python only)
    -h, --help              Show this help

Examples:
    $0                          # Start Python HTTP server on port 8000
    $0 -p 9000 -d /tmp          # Serve /tmp on port 9000
    $0 -t php -p 8080           # Use PHP built-in server
    $0 --upload -p 8000         # Enable file upload

EOF
}

PORT=8000
DIR="."
TYPE="python"
SSL=false
UPLOAD=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -d|--directory)
            DIR="$2"
            shift 2
            ;;
        -t|--type)
            TYPE="$2"
            shift 2
            ;;
        -s|--ssl)
            SSL=true
            shift
            ;;
        -u|--upload)
            UPLOAD=true
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

# Get local IP addresses
echo -e "${BLUE}Your IP addresses:${NC}"
ip -4 addr show | grep inet | grep -v 127.0.0.1 | awk '{print "  " $2}' | cut -d/ -f1

echo ""
echo -e "${GREEN}Starting HTTP server...${NC}"
echo -e "  Type: $TYPE"
echo -e "  Port: $PORT"
echo -e "  Directory: $DIR"
echo -e "  SSL: $SSL"
echo -e "  Upload: $UPLOAD"
echo ""

cd "$DIR"

case $TYPE in
    python|py)
        if [ "$UPLOAD" = true ]; then
            echo -e "${BLUE}Using uploadserver (pip3 install uploadserver)${NC}"
            if command -v uploadserver &> /dev/null; then
                python3 -m uploadserver $PORT
            else
                echo -e "${YELLOW}uploadserver not found, using basic Python server${NC}"
                echo -e "${YELLOW}Install with: pip3 install uploadserver${NC}"
                python3 -m http.server $PORT
            fi
        elif [ "$SSL" = true ]; then
            echo -e "${BLUE}Starting HTTPS server${NC}"
            python3 << EOF
import http.server
import ssl
server_address = ('0.0.0.0', $PORT)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket, certfile='cert.pem', keyfile='key.pem', server_side=True)
print('Server running on https://0.0.0.0:$PORT')
httpd.serve_forever()
EOF
        else
            python3 -m http.server $PORT
        fi
        ;;
    
    php)
        if command -v php &> /dev/null; then
            php -S 0.0.0.0:$PORT
        else
            echo -e "${RED}PHP not found${NC}"
            exit 1
        fi
        ;;
    
    ruby|rb)
        if command -v ruby &> /dev/null; then
            ruby -run -ehttpd . -p$PORT
        else
            echo -e "${RED}Ruby not found${NC}"
            exit 1
        fi
        ;;
    
    node|nodejs)
        if command -v node &> /dev/null; then
            if command -v http-server &> /dev/null; then
                http-server -p $PORT
            else
                echo -e "${YELLOW}http-server not found, install with: npm install -g http-server${NC}"
                node -e "require('http').createServer((req, res) => { res.writeHead(200); res.end('Node.js server running'); }).listen($PORT, '0.0.0.0', () => console.log('Server on port $PORT'));"
            fi
        else
            echo -e "${RED}Node.js not found${NC}"
            exit 1
        fi
        ;;
    
    *)
        echo -e "${RED}Unknown server type: $TYPE${NC}"
        echo "Supported types: python, php, ruby, node"
        exit 1
        ;;
esac
