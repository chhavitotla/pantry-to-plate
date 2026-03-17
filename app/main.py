from fastapi import FastAPI
from app.routes.recommend import router as recommend_router
from app.routes.recipe_chat import router as recipe_chat_router

app = FastAPI(title="Pantry AI Backend")
app.include_router(recommend_router, prefix="/api")
app.include_router(recipe_chat_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}
