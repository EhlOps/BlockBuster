from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from ..constants import BLOCKBUSTER_PATH
from ..client import client_router
from ..blocks import registry


def create_api() -> FastAPI:
    api = FastAPI()

    api.mount(
        "/static",
        StaticFiles(directory=BLOCKBUSTER_PATH / "client" / "static"),
        name="static",
    )

    api.include_router(client_router, tags=["client"])

    @api.get("/blocks")
    def get_blocks() -> JSONResponse:
        """
        Endpoint to retrieve the list of registered blocks.

        Returns:
            JSONResponse: A response containing the list of block names.
        """
        blocks = [block_data[1] for block_data in registry.values()]
        return JSONResponse(content={"blocks": blocks})

    @api.post("/load")
    def load_blocks() -> JSONResponse:
        """
        Endpoint to load blocks from the registry.

        This endpoint can be used to initialize or reload blocks in the system.

        Returns:
            JSONResponse: A response indicating the success of the operation.
        """
        # Logic to load blocks can be added here
        return JSONResponse(content={"message": "Blocks loaded successfully"})

    return api
