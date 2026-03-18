from typing import Any, Dict

from langgraph.graph import StateGraph, END

from app.agent.state import MealPlanState
from app.agent.nodes.selection import run_selection_node
from app.agent.nodes.prep_planner import run_prep_planner_node
from app.agent.nodes.day_planner import run_day_planner_node
from app.agent.nodes.formatter import run_formatter_node


# ── node name constants ────────────────────────────────────────────────────
NODE_SELECTION    = "selection"
NODE_PREP_PLANNER = "prep_planner"
NODE_DAY_PLANNER  = "day_planner"
NODE_FORMATTER    = "formatter"


def _should_continue(state: MealPlanState) -> str:
    """
    After every node, check if an error was set.
    If yes, skip straight to formatter so the error
    surfaces cleanly in the final output rather than
    crashing mid-graph.
    """
    if state.get("error"):
        return NODE_FORMATTER
    return "continue"


def build_meal_plan_graph() -> StateGraph:
    graph = StateGraph(MealPlanState)

    # ── register nodes ─────────────────────────────────────────────────
    graph.add_node(NODE_SELECTION,    run_selection_node)
    graph.add_node(NODE_PREP_PLANNER, run_prep_planner_node)
    graph.add_node(NODE_DAY_PLANNER,  run_day_planner_node)
    graph.add_node(NODE_FORMATTER,    run_formatter_node)

    # ── entry point ────────────────────────────────────────────────────
    graph.set_entry_point(NODE_SELECTION)

    # ── selection → prep_planner (or formatter on error) ──────────────
    graph.add_conditional_edges(
        NODE_SELECTION,
        _should_continue,
        {
            "continue":    NODE_PREP_PLANNER,
            NODE_FORMATTER: NODE_FORMATTER,
        },
    )

    # ── prep_planner → day_planner (or formatter on error) ────────────
    graph.add_conditional_edges(
        NODE_PREP_PLANNER,
        _should_continue,
        {
            "continue":    NODE_DAY_PLANNER,
            NODE_FORMATTER: NODE_FORMATTER,
        },
    )

    # ── day_planner → formatter (or formatter on error) ───────────────
    graph.add_conditional_edges(
        NODE_DAY_PLANNER,
        _should_continue,
        {
            "continue":    NODE_FORMATTER,
            NODE_FORMATTER: NODE_FORMATTER,
        },
    )

    # ── formatter → END ────────────────────────────────────────────────
    graph.add_edge(NODE_FORMATTER, END)

    return graph


# ── compile once at import time, reuse across requests ────────────────────
meal_plan_graph = build_meal_plan_graph().compile()


def run_meal_plan_agent(initial_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Entry point called by the route.
    Accepts a plain dict, runs the compiled graph, returns final state.
    """
    final_state = meal_plan_graph.invoke(initial_state)
    return final_state