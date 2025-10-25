"""
Error handling and logging utilities for HTB Helper.
Provides enhanced error logging with timestamps and visual progress indicators.
"""

import time
import sys
from datetime import datetime
from pathlib import Path

# Color codes for terminal output
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def log_error(error, step, log_file="error_log.txt"):
    """
    Log the error to a file with timestamp and context.
    
    Args:
        error: The exception or error message
        step: The step/function where the error occurred
        log_file: Path to the log file
    """
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Create log directory if needed
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Format error message
    error_msg = f"{timestamp} - Error during {step}: {error}\n"
    
    # Write to log file
    with open(log_file, "a") as file:
        file.write(error_msg)
        # Add traceback if available
        import traceback
        if hasattr(error, '__traceback__'):
            file.write(traceback.format_exc())
            file.write("\n")
    
    # Also print to stderr with color
    print(f"{Colors.RED}✗ Error during {step}: {error}{Colors.NC}", file=sys.stderr)

def log_info(message, log_file="htb_helper.log"):
    """
    Log informational message to log file.
    
    Args:
        message: The message to log
        log_file: Path to the log file
    """
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_msg = f"{timestamp} - INFO - {message}\n"
    
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(log_file, "a") as file:
        file.write(log_msg)

def log_success(message):
    """Print success message in green."""
    print(f"{Colors.GREEN}✓ {message}{Colors.NC}")

def log_warning(message):
    """Print warning message in yellow."""
    print(f"{Colors.YELLOW}⚠ {message}{Colors.NC}")

def log_info_color(message):
    """Print info message in blue."""
    print(f"{Colors.BLUE}ℹ {message}{Colors.NC}")

def loading_bar(duration=5, message="Processing", width=50):
    """
    Display an ASCII loading bar with message.
    
    Args:
        duration: Duration in seconds
        message: Message to display
        width: Width of the progress bar
    """
    for i in range(duration):
        progress = int((i + 1) / duration * width)
        bar = '#' * progress + '.' * (width - progress)
        percentage = ((i + 1) / duration) * 100
        print(f"\r{message} [{bar}] {percentage:.0f}%", end="", flush=True)
        time.sleep(1)
    print()  # Move to the next line after loading bar completes

def progress_bar(current, total, message="Progress", width=50):
    """
    Display a progress bar for iterative operations.
    
    Args:
        current: Current iteration number
        total: Total number of iterations
        message: Message to display
        width: Width of the progress bar
    """
    progress = int(current / total * width)
    bar = '#' * progress + '.' * (width - progress)
    percentage = (current / total) * 100
    print(f"\r{message} [{bar}] {percentage:.0f}% ({current}/{total})", end="", flush=True)
    
    if current == total:
        print()  # New line when complete

def spinner(duration=5, message="Processing"):
    """
    Display a spinner animation.
    
    Args:
        duration: Duration in seconds
        message: Message to display
    """
    spinner_chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    end_time = time.time() + duration
    i = 0
    
    while time.time() < end_time:
        print(f"\r{message} {spinner_chars[i % len(spinner_chars)]}", end="", flush=True)
        time.sleep(0.1)
        i += 1
    
    print(f"\r{message} ✓", flush=True)

