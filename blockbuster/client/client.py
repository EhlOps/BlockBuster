"""
The BlockBuster client module provides the FastAPI router for serving the BlockBuster web client.
"""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from ..constants import BLOCKBUSTER_PATH

client_router = APIRouter()

@client_router.get("/", response_class=HTMLResponse)
async def root():
    with open(BLOCKBUSTER_PATH / "client" / "index.html", "r") as f:
        content = f.read()
    return HTMLResponse(content=content)