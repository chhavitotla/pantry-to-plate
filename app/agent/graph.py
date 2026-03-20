from typing import Any, Dict

from langgraph.graph import END, StateGraph

from app.agent.nodes.formatter import run_formatter_node
from app.agent.nodes.meal_planning import run_meal_planning_node
from app.agent.nodes.nutrition_evaluation import run_nutrition_evaluation_node
from app.agent.nodes.nutrition_optimization import run_nutrition_optimization_node
from app.agent.nodes.pantry_management import run_pantry_management_node
from app.agent.state import MealPlanState
from app.core.config import settings

try:
    from langchain_core.tracers.context import tracing_v2_enabled
except Exception:  # pragma: no cover - tracing fallback
    tracing_v2_enabled = None


NODE_MEAL_PLANNING = "meal_planning"
NODE_PANTRY_MANAGEMENT = "pantry_management"
NODE_NUTRITION_EVALUATION = "nutrition_evaluation"
NODE_NUTRITION_OPTIMIZATION = "nutrition_optimization"
NODE_FORMATTER = "formatter"


def _route_after_basic_step(state: MealPlanState) -> str:
    if state.get("error"):
        return NODE_FORMATTER
    return "continue"


def _route_after_evaluation(state: MealPlanState) -> str:
    if state.get("error"):
        return NODE_FORMATTER
    if state.get("is_satisfactory"):
        return NODE_FORMATTER
    if int(state.get("iteration", 0)) >= int(state.get("max_iterations", 2)):
        return NODE_FORMATTER
    return NODE_NUTRITION_OPTIMIZATION


def build_meal_plan_graph() -> StateGraph:
    graph = StateGraph(MealPlanState)
    graph.add_node(NODE_MEAL_PLANNING, run_meal_planning_node)
    graph.add_node(NODE_PANTRY_MANAGEMENT, run_pantry_management_node)
    graph.add_node(NODE_NUTRITION_EVALUATION, run_nutrition_evaluation_node)
    graph.add_node(NODE_NUTRITION_OPTIMIZATION, run_nutrition_optimization_node)
    graph.add_node(NODE_FORMATTER, run_formatter_node)

    graph.set_entry_point(NODE_MEAL_PLANNING)

    graph.add_conditional_edges(
        NODE_MEAL_PLANNING,
        _route_after_basic_step,
        {
            "continue": NODE_PANTRY_MANAGEMENT,
            NODE_FORMATTER: NODE_FORMATTER,
        },
    )

    graph.add_conditional_edges(
        NODE_PANTRY_MANAGEMENT,
        _route_after_basic_step,
        {
            "continue": NODE_NUTRITION_EVALUATION,
            NODE_FORMATTER: NODE_FORMATTER,
        },
    )

    graph.add_conditional_edges(
        NODE_NUTRITION_EVALUATION,
        _route_after_evaluation,
        {
            NODE_NUTRITION_OPTIMIZATION: NODE_NUTRITION_OPTIMIZATION,
            NODE_FORMATTER: NODE_FORMATTER,
        },
    )

    graph.add_conditional_edges(
        NODE_NUTRITION_OPTIMIZATION,
        _route_after_basic_step,
        {
            "continue": NODE_PANTRY_MANAGEMENT,
            NODE_FORMATTER: NODE_FORMATTER,
        },
    )

    graph.add_edge(NODE_FORMATTER, END)
    return graph


meal_plan_graph = build_meal_plan_graph().compile()


def run_meal_plan_agent(initial_state: Dict[str, Any]) -> Dict[str, Any]:
    invoke_config: Dict[str, Any] = {
        "metadata": {
            "feature": "meal_plan_multi_agent",
            "goal": initial_state.get("goal", ""),
            "meal_type": initial_state.get("meal_type", ""),
        }
    }

    if settings.langsmith_tracing_enabled and tracing_v2_enabled is not None:
        with tracing_v2_enabled(project_name=settings.langsmith_project):
            return meal_plan_graph.invoke(initial_state, config=invoke_config)

    return meal_plan_graph.invoke(initial_state, config=invoke_config)
