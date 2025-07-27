import argparse
from pathlib import Path

import uvicorn
import logging

from .api import create_api

def main():
    """
    Main function to run the CLI.
    """
    logger = logging.getLogger("uvicorn.error")
    parser = argparse.ArgumentParser(description="BlockBuster CLI")

    parser.add_argument("directory", type=str, default=".", nargs="?", 
    help="directory to run the BlockBuster CLI on, defaults the current directory")
    parser.add_argument("-p", "--port", type=int, default=8000, help="the port to run the CLI on")

    args = parser.parse_args()
    directory = Path(args.directory).resolve()
    if not directory.is_dir():
        logger.error(f"Provided path {directory} is not a valid directory.")
        return
    
    port = args.port

    api = create_api()
    uvicorn.run(api, host="0.0.0.0", port=port, log_level="info")