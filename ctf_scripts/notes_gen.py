#!/usr/bin/env python3
"""
CTF Notes Template Generator
Creates structured note templates for CTF challenges
"""

import argparse
import os
from datetime import datetime

def create_recon_template(machine_name, machine_ip):
    """Create reconnaissance notes template."""
    return f"""# {machine_name} - Reconnaissance

**Target IP:** {machine_ip}
**Date:** {datetime.now().strftime('%Y-%m-%d')}
**Time Started:** {datetime.now().strftime('%H:%M:%S')}

---

## Initial Information Gathering

### Host Discovery
```bash
ping -c 4 {machine_ip}
```

### Port Scanning
```bash
# Quick scan
nmap -Pn -n -vv --open -F -T4 {machine_ip}

# Full TCP scan
nmap -Pn -n -p- -vv --open -T4 {machine_ip}

# Service version scan
nmap -Pn -n -p <ports> -sV -sC -T4 {machine_ip}
```

**Open Ports:**
- Port XXX: Service
- Port XXX: Service

### Service Enumeration

#### HTTP/HTTPS (Port XX)
```bash
# Technology detection
whatweb http://{machine_ip}

# Directory enumeration
gobuster dir -u http://{machine_ip} -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

# Nikto scan
nikto -h http://{machine_ip}
```

**Findings:**
- 

#### SMB (Port 445)
```bash
# SMB enumeration
enum4linux -a {machine_ip}
smbclient -L //{machine_ip}
```

**Findings:**
- 

#### SSH (Port 22)
```bash
# SSH banner
nc -nv {machine_ip} 22
```

**Version:** 

---

## Vulnerabilities Identified

1. **Vulnerability Name**
   - **Severity:** High/Medium/Low
   - **Description:** 
   - **CVE:** 
   - **Exploit Available:** Yes/No
   - **Notes:** 

---

## Exploitation

### Initial Access

**Vector:** 

**Steps:**
1. 
2. 
3. 

**Shell Obtained:**
- User: 
- Shell Type: 
- Stability: 

### Commands Used
```bash

```

---

## Post-Exploitation

### User Flag
**Location:** 
**Content:** 

### Privilege Escalation

**Vector:** 

**Enumeration:**
```bash
# System information
uname -a
cat /etc/os-release

# User privileges
id
sudo -l

# SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Interesting files
find / -name "*.conf" 2>/dev/null
```

**Steps:**
1. 
2. 
3. 

### Root Flag
**Location:** 
**Content:** 

---

## Lessons Learned

1. 
2. 
3. 

---

## Tools Used

- 
- 
- 

---

## References

- 
- 

"""

def create_checklist_template():
    """Create enumeration checklist."""
    return """# CTF Enumeration Checklist

## Initial Recon
- [ ] Ping scan
- [ ] Quick port scan (top 1000)
- [ ] Full port scan
- [ ] Service version detection
- [ ] OS detection
- [ ] Vulnerability scanning

## Web Enumeration (if applicable)
- [ ] Browse website manually
- [ ] Check robots.txt, sitemap.xml
- [ ] View page source for comments
- [ ] Technology detection (Wappalyzer/whatweb)
- [ ] Directory fuzzing
- [ ] Subdomain enumeration
- [ ] Parameter fuzzing
- [ ] Check for default credentials
- [ ] SQL injection testing
- [ ] XSS testing
- [ ] File upload vulnerabilities
- [ ] Check for LFI/RFI
- [ ] API endpoints enumeration

## SMB Enumeration (if applicable)
- [ ] List shares
- [ ] Check share permissions
- [ ] Check for null session
- [ ] Enumerate users
- [ ] Check SMB version for vulnerabilities

## FTP Enumeration (if applicable)
- [ ] Anonymous login
- [ ] Check FTP version
- [ ] List files
- [ ] Check write permissions

## SSH Enumeration (if applicable)
- [ ] Check SSH version
- [ ] User enumeration
- [ ] Check for weak keys
- [ ] Brute force (if necessary)

## Database Enumeration (if applicable)
- [ ] Check for default credentials
- [ ] Version detection
- [ ] Enumerate databases
- [ ] Enumerate tables
- [ ] Extract data

## Linux Privilege Escalation
- [ ] Check sudo permissions
- [ ] Find SUID/SGID files
- [ ] Check cron jobs
- [ ] Check for writable files
- [ ] Check kernel version
- [ ] LinPEAS/LinEnum
- [ ] Check for passwords in files
- [ ] Check environment variables

## Windows Privilege Escalation
- [ ] Check privileges (whoami /priv)
- [ ] Check user groups
- [ ] WinPEAS
- [ ] Check for unquoted service paths
- [ ] Check for weak service permissions
- [ ] Check scheduled tasks
- [ ] Check for stored credentials
- [ ] Check registry for AutoLogon

## Flags
- [ ] User flag obtained
- [ ] Root/Admin flag obtained

"""

def create_findings_template():
    """Create findings documentation template."""
    return """# Security Findings Report

## Executive Summary

Brief overview of the assessment and key findings.

---

## Findings

### [CRITICAL/HIGH/MEDIUM/LOW] Finding Name

**Risk Rating:** Critical/High/Medium/Low
**CVSS Score:** X.X

**Description:**
Detailed description of the vulnerability or finding.

**Impact:**
What could an attacker do with this vulnerability?

**Affected Component:**
- Component/Service: 
- Version: 
- Location: 

**Evidence:**
```
Commands or screenshots showing the vulnerability
```

**Recommendations:**
1. Primary recommendation
2. Alternative recommendation
3. Compensating control

**References:**
- CVE-XXXX-XXXXX
- https://example.com/advisory

---

### [RISK] Finding Name 2

[Repeat structure above]

---

## Remediation Priority

1. **Critical Issues** (Immediate action required)
   - Finding 1
   
2. **High Priority** (Action within 1 week)
   - Finding 2
   
3. **Medium Priority** (Action within 1 month)
   - Finding 3
   
4. **Low Priority** (Action as resources permit)
   - Finding 4

---

## Conclusion

Summary of the assessment.

"""

def main():
    parser = argparse.ArgumentParser(
        description='Generate CTF note templates',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument('-t', '--type', 
                        choices=['recon', 'checklist', 'findings', 'all'],
                        default='all',
                        help='Type of template to generate')
    parser.add_argument('-n', '--name',
                        help='Machine name (for recon template)')
    parser.add_argument('-i', '--ip',
                        help='Machine IP (for recon template)')
    parser.add_argument('-o', '--output',
                        help='Output directory (default: current directory)')
    
    args = parser.parse_args()
    
    output_dir = args.output or '.'
    os.makedirs(output_dir, exist_ok=True)
    
    templates = {
        'recon': ('recon_notes.md', create_recon_template),
        'checklist': ('checklist.md', lambda *_: create_checklist_template()),
        'findings': ('findings_report.md', lambda *_: create_findings_template()),
    }
    
    types_to_create = ['recon', 'checklist', 'findings'] if args.type == 'all' else [args.type]
    
    for template_type in types_to_create:
        filename, generator = templates[template_type]
        filepath = os.path.join(output_dir, filename)
        
        if template_type == 'recon':
            if not args.name or not args.ip:
                print(f"⚠ Skipping recon template: --name and --ip required")
                continue
            content = generator(args.name, args.ip)
        else:
            content = generator()
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"✓ Created {filepath}")
    
    print("\n✓ Template generation complete!")

if __name__ == '__main__':
    main()
