from pydantic import BaseModel
from typing import List, Optional, Dict

class BilingualText(BaseModel):
    en: str = ""
    ar: str = ""

# --- Dev Environment Schemas ---
class DevEnvironmentBlockBase(BaseModel):
    title: BilingualText
    description: BilingualText
    terminal_command: Optional[str] = None

class DevEnvironmentBlockCreate(DevEnvironmentBlockBase):
    pass

class DevEnvironmentBlock(DevEnvironmentBlockBase):
    id: int

    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: BilingualText
    task_type: str
    
    allowed_syscalls: Optional[List[str]] = []
    
    technical_requirements: Optional[BilingualText] = None
    example_main_code: Optional[str] = None
    raw_terminal_output: Optional[str] = None
    points: int = 10
    is_completed: bool = False

class TaskCreate(TaskBase):
    pass

class BulkTaskCreate(BaseModel):
    tasks: List[TaskCreate]

class Task(TaskBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectBase(BaseModel):
    title: BilingualText
    directory_name: str
    
    global_constraints: Optional[List[str]] = []
    forbidden_functions: Optional[List[str]] = []
    compiler_flags: Optional[List[str]] = []
    
    skill_tags: Optional[Dict[str, float]] = {}
    
    deadline: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    sprint_id: int
    tasks: List[Task] = []

    class Config:
        from_attributes = True

# --- Sprint Schemas ---
class SprintBase(BaseModel):
    title: BilingualText
    description: Optional[BilingualText] = None
    skill_weights: Optional[Dict[str, int]] = {}

class SprintCreate(SprintBase):
    pass

class Sprint(SprintBase):
    id: int
    projects: List[Project] = []

    class Config:
        from_attributes = True

# --- Macro Ingestion Schemas ---
class MacroTaskCreate(TaskCreate):
    pass

class MacroProjectCreate(ProjectCreate):
    tasks: List[MacroTaskCreate] = []

class MacroSprintCreate(SprintCreate):
    projects: List[MacroProjectCreate] = []

