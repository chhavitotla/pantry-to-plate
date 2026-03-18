from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.recommend import router as recommend_router
from app.routes.recipe_chat import router as recipe_chat_router
from app.routes.meal_plan import router as meal_plan_router

app = FastAPI(title="Pantry AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend_router, prefix="/api")
app.include_router(recipe_chat_router, prefix="/api")
app.include_router(meal_plan_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}