from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from ..constants import BLOCKBUSTER_PATH
from ..client import client_router

def create_api() -> FastAPI:
    api = FastAPI()

    api.mount("/static", StaticFiles(directory=BLOCKBUSTER_PATH / "client" / "static"), name="static")

    api.include_router(client_router, tags=["client"])

    return api