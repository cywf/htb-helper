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

[MIT](LICENSE)

