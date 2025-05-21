from typing import TypedDict, List

class ScenarioState(TypedDict):
    summary: str
    reply_scenarios: List[str]
    current_agent: str
    next_agent: str
    done: bool