import logging

import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.apis.sumarize_router import summarize_router
from app.apis.scenario_router import scenario_router
from app.apis.reply_router import reply_router
from app.apis.chatbot_router import chatbot_router
from app.apis.search_router import search_router
from app.apis.model_router import model_router
from app.apis.label_router import label_router
from app.core.config import settings

logging.config.fileConfig(settings.LOGGING_CONFIG_FILE, disable_existing_loggers=False)


def get_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME, docs_url="/docs", redoc_url='/re-docs',
        openapi_url=f"{settings.API_PREFIX}/openapi.json",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(summarize_router, prefix=settings.API_PREFIX)
    application.include_router(scenario_router, prefix=settings.API_PREFIX)
    application.include_router(reply_router, prefix=settings.API_PREFIX)
    application.include_router(chatbot_router, prefix=settings.API_PREFIX)
    application.include_router(search_router, prefix=settings.API_PREFIX)
    application.include_router(model_router, prefix=settings.API_PREFIX)
    application.include_router(label_router,prefix=settings.API_PREFIX)

    return application


application = get_application()
if __name__ == '__main__':
    uvicorn.run(application, host="0.0.0.0", port=8000)