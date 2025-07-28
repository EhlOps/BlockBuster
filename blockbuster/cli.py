import argparse
from pathlib import Path
import importlib.util
import sys

import uvicorn
import logging

from .api import create_api


def main():
    """
    Main function to run the CLI.
    """
    logger = logging.getLogger("uvicorn.error")
    parser = argparse.ArgumentParser(description="BlockBuster CLI")

    parser.add_argument(
        "directory",
        type=str,
        default=".",
        nargs="?",
        help="directory to run the BlockBuster CLI on, defaults the current directory",
    )
    parser.add_argument(
        "-p", "--port", type=int, default=8000, help="the port to run the CLI on"
    )

    args = parser.parse_args()
    directory = Path(args.directory).resolve()
    if not directory.is_dir():
        logger.error(f"Provided path {directory} is not a valid directory.")
        return
    for file in directory.glob("*.py"):
        if file.name.startswith("_"):
            continue
        try:
            module_stem = (
                file.stem
                if file.stem != "__init__" and file.stem != "registry"
                else f"_{file.stem}"
            )
            module_name = f"blockbuster.blocks.{module_stem}"
            spec = importlib.util.spec_from_file_location(
                module_name, directory / file.name
            )
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            spec.loader.exec_module(module)
        except Exception as e:
            logger.error(f"Error executing {file}: {e}")

    port = args.port

    api = create_api()
    uvicorn.run(api, host="0.0.0.0", port=port, log_level="info")
