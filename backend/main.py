from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

# Create all tables natively with JSON mapping
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Command Center Local API")

# Allow local frontend to seamlessly talk to local backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/ping")
def health_check():
    return {"status": "Command Center Active"}


# --- Sprints ---
@app.get("/api/sprints", response_model=List[schemas.Sprint])
def read_sprints(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Sprint).offset(skip).limit(limit).all()

@app.post("/api/sprints", response_model=schemas.Sprint)
def create_sprint(sprint: schemas.SprintCreate, db: Session = Depends(get_db)):
    db_sprint = models.Sprint(**sprint.model_dump())
    db.add(db_sprint)
    db.commit()
    db.refresh(db_sprint)
    return db_sprint


# --- Projects ---
@app.get("/api/projects", response_model=List[schemas.Project])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Project).offset(skip).limit(limit).all()

@app.get("/api/projects/{project_id}", response_model=schemas.Project)
def read_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@app.post("/api/sprints/{sprint_id}/projects", response_model=schemas.Project)
def create_project(sprint_id: int, project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_sprint = db.query(models.Sprint).filter(models.Sprint.id == sprint_id).first()
    if db_sprint is None:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    db_project = models.Project(**project.model_dump(), sprint_id=sprint_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.put("/api/projects/{project_id}", response_model=schemas.Project)
def update_project(project_id: int, project_update: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project


# --- Tasks ---
@app.get("/api/tasks", response_model=List[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Task).offset(skip).limit(limit).all()

@app.post("/api/projects/{project_id}/tasks", response_model=schemas.Task)
def create_task(project_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_task = models.Task(**task.model_dump(), project_id=project_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.post("/api/sprints/macro-inject", response_model=schemas.Sprint)
def macro_inject_sprint(payload: schemas.MacroSprintCreate, db: Session = Depends(get_db)):
    # 1. Get or Create Sprint
    title_en = payload.title.en if hasattr(payload.title, 'en') else None
    title_ar = payload.title.ar if hasattr(payload.title, 'ar') else None
    
    import json
    existing_sprints = db.query(models.Sprint).all()
    db_sprint = None
    for sprint in existing_sprints:
        s_title = sprint.title
        if isinstance(s_title, str):
            try:
                s_title = json.loads(s_title)
            except:
                s_title = {}
        if isinstance(s_title, dict):
            if (title_en and s_title.get("en") == title_en) or (title_ar and s_title.get("ar") == title_ar):
                db_sprint = sprint
                break
            
    if not db_sprint:
        sprint_data = payload.model_dump(exclude={"projects"})
        db_sprint = models.Sprint(**sprint_data)
        db.add(db_sprint)
        db.flush() # Assure sprint ID is generated
    
    # 2. Iterate Projects
    for proj_in in payload.projects:
        proj_data = proj_in.model_dump(exclude={"tasks"})
        db_proj = models.Project(**proj_data, sprint_id=db_sprint.id)
        db.add(db_proj)
        db.flush() # Assure project ID is generated
        
        # 3. Iterate Tasks
        for task_in in proj_in.tasks:
            task_data = task_in.model_dump()
            db_task = models.Task(**task_data, project_id=db_proj.id)
            db.add(db_task)
            
    # Atomic Commit
    db.commit()
    db.refresh(db_sprint)
    return db_sprint

@app.post("/api/projects/{project_id}/tasks/bulk", response_model=List[schemas.Task])
def create_tasks_bulk(project_id: int, bulk_payload: schemas.BulkTaskCreate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    created_tasks = []
    # Dump Pydantic models to dicts before SQLAlchemy instantiation due to nested objects
    for task_in in bulk_payload.tasks:
        db_task = models.Task(**task_in.model_dump(), project_id=project_id)
        db.add(db_task)
        created_tasks.append(db_task)
    
    db.commit()
    for task in created_tasks:
        db.refresh(task)
        
    return created_tasks

@app.put("/api/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

# --- Omni-Edit Additions (Phase 14) ---
@app.put("/api/sprints/{sprint_id}", response_model=schemas.Sprint)
def update_sprint(sprint_id: int, sprint_update: schemas.SprintCreate, db: Session = Depends(get_db)):
    db_sprint = db.query(models.Sprint).filter(models.Sprint.id == sprint_id).first()
    if db_sprint is None:
        raise HTTPException(status_code=404, detail="Sprint not found")
    
    update_data = sprint_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_sprint, key, value)
    
    db.commit()
    db.refresh(db_sprint)
    return db_sprint

@app.delete("/api/sprints/{sprint_id}")
def delete_sprint(sprint_id: int, db: Session = Depends(get_db)):
    db_sprint = db.query(models.Sprint).filter(models.Sprint.id == sprint_id).first()
    if not db_sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    db.delete(db_sprint)
    db.commit()
    return {"status": "success", "message": "Sprint purged"}

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"status": "success", "message": "Project purged"}

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"status": "success", "message": "Task purged"}

# --- Dev Environment Blocks ---
@app.get("/api/environment", response_model=List[schemas.DevEnvironmentBlock])
def read_dev_environments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.DevEnvironmentBlock).offset(skip).limit(limit).all()

@app.post("/api/environment", response_model=schemas.DevEnvironmentBlock)
def create_dev_environment(env_block: schemas.DevEnvironmentBlockCreate, db: Session = Depends(get_db)):
    db_env = models.DevEnvironmentBlock(**env_block.model_dump())
    db.add(db_env)
    db.commit()
    db.refresh(db_env)
    return db_env

@app.put("/api/environment/{env_id}", response_model=schemas.DevEnvironmentBlock)
def update_dev_environment(env_id: int, env_update: schemas.DevEnvironmentBlockCreate, db: Session = Depends(get_db)):
    db_env = db.query(models.DevEnvironmentBlock).filter(models.DevEnvironmentBlock.id == env_id).first()
    if not db_env:
        raise HTTPException(status_code=404, detail="Environment Block not found")
    
    update_data = env_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_env, key, value)
    
    db.commit()
    db.refresh(db_env)
    return db_env

@app.delete("/api/environment/{env_id}")
def delete_dev_environment(env_id: int, db: Session = Depends(get_db)):
    db_env = db.query(models.DevEnvironmentBlock).filter(models.DevEnvironmentBlock.id == env_id).first()
    if not db_env:
        raise HTTPException(status_code=404, detail="Environment Block not found")
    db.delete(db_env)
    db.commit()
    return {"status": "success", "message": "Environment Block purged"}

@app.delete("/api/system/purge")
def system_purge():
    # Drop completely natively via SQLAlchemy
    models.Base.metadata.drop_all(bind=engine)
    # Recreate the fresh empty schema natively
    models.Base.metadata.create_all(bind=engine)
    return {"status": "success", "message": "Absolute System DB Purge Executed"}
