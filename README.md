# HTB-Helper

A comprehensive tool designed to assist penetration testers and security enthusiasts in their Hack The Box (HTB) challenges. htb-helper streamlines the initial phases of a penetration test by automating common tasks such as Nmap scanning, payload generation, and error handling.

## Features

* **User Input Collection**: Gather essential details like machine name, IP, and type.
* **Directory Structure Setup**: Organize your penetration testing assets for each machine.
* **Tool Installation**: Ensure necessary tools like Nmap are installed and ready to use.
* **Nmap Scanning**: Perform various levels of Nmap scans based on user preference.
* **Advanced Nmap Scripts**: Run vulnerability-specific Nmap scripts based on the target machine type.
* **Payload Generation**: Automatically generate payloads using msfvenom based on the target machine type.
* **Error Handling**: Log errors to error_log.txt and provide a visual loading bar for task progress.

## Directory Structure

- [error_handling.py](https://github.com/cywf/htb-helper/error_handling.py): Error logging and handling functions.
- [main.py](https://github.com/cywf/htb-helper/main.py): Main script to run the tool.
- [nmap_payload_gen.py](https://github.com/cywf/htb-helper/nmap_payload_gen.py): Nmap scanning and payload generation functions.
- [tools.py](https://github.com/cywf/htb-helper/tools.py): Tool installation and setup functions.
- [setup.py](https://github.com/cywf/htb-helper/setup.py): User input and directory setup functions.
- [networking](https://github.com/cywf/htb-helper/networking): Resources and scripts related to networking tasks.
- [systems](https://github.com/cywf/htb-helper/systems): Guides and resources for Linux, MacOS, and Windows systems.
- [web](https://github.com/cywf/htb-helper/web): Resources related to web-based vulnerabilities and attacks.

## Usage

Clone the repository:

```bash
git clone https://github.com/[YourUsername]/htb-helper.git
```
Navigate to the htb-helper directory:

```bash
cd htb-helper
```
Run the main script:

```bash
python3 main.py
```
Follow the on-screen prompts to set up and execute various tasks.

### Requirements

- **Python 3.x**
- **Nmap**
- **Msfvenom (from Metasploit Framework)**

### Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### License

The HTB-Helper tool is licensed under the [MIT](https://github.com/cywf/htb-helper/LICENSE), because we believe in open-source software and the free dissemination of knowledge.

