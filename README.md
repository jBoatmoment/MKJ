# BokoHacks 2025
An Application Security Challenge Platform for Texas State University's 2025 BokoHacks

## Overview
This repository contains a deliberately vulnerable web application that was provided to us as part of a security-focused project. The goal was to identify, analyze, and patch common web security vulnerabilities through hands-on practice. The application includes challenges related to SQL injection, XSS (Cross-Site Scripting), broken access control, and authentication bypass.

We worked on discovering and fixing these vulnerabilities to better understand real-world security flaws and how to defend against them.

## Requirements
- Python 3.8 or higher → [Download Python](https://www.python.org/downloads/)
- Pip (Python package installer)
- SQLite → [Download SQLite](https://www.sqlite.org/download.html) (Optional if you want binaries otherwise; dependencies should install automatically)
- Modern web browser (Chrome/Firefox recommended)
- Text editor or IDE VS Code recommended → [VS Code Setup](https://code.visualstudio.com/docs/python/environments)

## Setup Instructions
1. Clone the repository:
```bash
git clone https://github.com/Nick4453/Boko-Hacks-2025.git
cd boko-hacks-2025
```
2. Git Setup (For Beginners)

1) Install Git
- Download and install Git from [git-scm.com](https://git-scm.com/downloads)
- After installation, verify Git is installed by running command prompt:
```
git --version
```
2) Configure Git (Required for First-Time Users)
Run the following commands to set your username and email (needed for commits):
```
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
```
To check your Git settings:
```
git config --list
```
3) Using Git with HTTPS (Easiest for Beginners)
- Clone repositories using HTTPS (no extra setup required):
```
git clone https://github.com/Nick4453/Boko-Hacks-2025.git
```
- If prompted for credentials frequently, enable credential manager:
```
git config --global credential.helper cache
```
4) Setting Up Git in VS Code
- Open VS Code and install the Git Extension (built-in for most versions).
- Open terminal in VS Code and check Git is recognized:
```
git --version
```
- Set VS Code as your default Git editor:
```
git config --global core.editor "code --wait"
```

5) Create and activate a virtual environment (recommended): (You can also do this through VS Code)
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Mac/Linux
python3 -m venv .venv
source .venv/bin/activate
```
VS Code Setup ---> https://code.visualstudio.com/docs/python/environments

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Initialize the database: (You may not need to do this step; if it doesn't work, check that your env path is correct)
```bash
python -c "from app import app, setup_database; app.app_context().push(); setup_database()"
```

6. Start the application: 
```bash
python app.py
```

7. Open http://localhost:5000 in your browser

8. Shut Down the Application
To stop the application, press Ctrl + C in the terminal where the application is running. This will terminate the Flask server.

## Learning Resources
If you're new to web application security testing, here are some resources to help you understand the vulnerabilities you might encounter:

1. [OWASP Top 10](https://owasp.org/www-project-top-ten/) - The standard awareness document for web application security
2. [PortSwigger Web Security Academy](https://portswigger.net/web-security) - Free, online web security training
3. [SQL Injection Cheat Sheet](https://portswigger.net/web-security/sql-injection/cheat-sheet)
4. [XSS Cheat Sheet](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)
5. [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings) - A list of useful payloads for bypassing security controls

## Development Notes
- The application uses Flask for the backend
- SQLite databases store application data
- Frontend uses vanilla JavaScript and CSS
- All vulnerabilities are intentional for educational purposes

## Security Notice
This application contains intentional security vulnerabilities for educational purposes. **DO NOT**:
- **Use real credentials or sensitive information while testing**
- Deploy this application on a public network or server
- Use techniques learned here against real websites without explicit permission
**NOTE: IF YOU USE REAL CREDENTIALS, IE: PASSWORDS YOU ACTUALLY USE, WHEN YOU UPLOAD YOUR REPO, THE DATABASE WILL BE PUBLIC. THIS DATABASE CAN BE CONVERTED EASILY ONLINE UNLESS ENCRYPTED**

## License
MIT License - See LICENSE file for details
