import time
import uvicorn
from fastapi import FastAPI
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

from app.app_bundle.database.db_core import get_db_session_db
from app.app_bundle.env_config_settings import get_settings
from app.user.user_view import user_router
from app.visit.visit_view import visit_router

# app = FastAPI(title=get_settings().tenant_id.title())
app = FastAPI(
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:5173"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    ],
    title=get_settings().tenant_id.title()
)
# app.add_middleware(CorrelationIdMiddleware)


async def start_db():
    await get_db_session_db()


async def shutdown_event():
    print("Shutting down API")

# @app.middleware("http")
# async def add_cors_headers(request: Request, call_next):
#     if request.method == "OPTIONS":
#         response = Response()
#     else:
#         response = await call_next(request)
#     response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
#     response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
#     response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
#     response.headers["Access-Control-Allow-Credentials"] = "true"
#     return response


app.add_event_handler("startup", start_db)
app.add_event_handler("shutdown", shutdown_event)


app.include_router(user_router, prefix="/api/v1/user")
app.include_router(visit_router, prefix="/api/v1/visit")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
