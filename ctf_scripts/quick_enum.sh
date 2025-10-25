#!/bin/bash
# Quick Enumeration Script for Linux
# Run this on the target machine after getting a shell

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Quick Linux Enumeration${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# System Information
echo -e "${GREEN}[+] System Information${NC}"
echo "Hostname: $(hostname 2>/dev/null)"
echo "Kernel: $(uname -r 2>/dev/null)"
echo "OS: $(cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d'"' -f2)"
echo ""

# Current User
echo -e "${GREEN}[+] Current User${NC}"
whoami
id
echo ""

# Sudo Privileges
echo -e "${GREEN}[+] Sudo Privileges${NC}"
sudo -l 2>/dev/null || echo "Cannot check sudo privileges"
echo ""

# SUID Files
echo -e "${GREEN}[+] SUID Files${NC}"
find / -perm -4000 -type f 2>/dev/null | head -20
echo ""

# Writable Files
echo -e "${GREEN}[+] World-Writable Files (sample)${NC}"
find / -writable -type f 2>/dev/null | grep -v proc | grep -v sys | head -20
echo ""

# Network Information
echo -e "${GREEN}[+] Network Information${NC}"
ip a 2>/dev/null || ifconfig 2>/dev/null
echo ""

# Listening Ports
echo -e "${GREEN}[+] Listening Ports${NC}"
netstat -tulpn 2>/dev/null || ss -tulpn 2>/dev/null
echo ""

# Scheduled Tasks
echo -e "${GREEN}[+] Cron Jobs${NC}"
cat /etc/crontab 2>/dev/null
ls -la /etc/cron* 2>/dev/null
echo ""

# Users with Login
echo -e "${GREEN}[+] Users with Shell Access${NC}"
cat /etc/passwd | grep -v nologin | grep -v false
echo ""

# Password Files
echo -e "${GREEN}[+] Checking Password Files${NC}"
ls -la /etc/passwd /etc/shadow 2>/dev/null
echo ""

# Interesting Files
echo -e "${GREEN}[+] Interesting Files${NC}"
find / -name "*.conf" -o -name "*.config" -o -name "*.bak" 2>/dev/null | grep -v proc | grep -v sys | head -20
echo ""

# Environment Variables
echo -e "${GREEN}[+] Environment Variables${NC}"
env 2>/dev/null
echo ""

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Enumeration Complete${NC}"
echo -e "${BLUE}================================${NC}"
