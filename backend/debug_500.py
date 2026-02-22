import json
from datetime import datetime, timedelta
import schemas, models, database

deadline_iso = (datetime.now() + timedelta(days=7)).isoformat()

macro_payload = {
    "title": {"en": "Phase 13: The Macro Benchmark", "ar": "المرحلة 13: معيار الماكرو"},
    "description": {"en": "Testing hierarchical overrides.", "ar": "اختبار التجاوزات الهرمية."},
    "skill_weights": {
        "C Algorithms": 4,
        "Reverse Engineering": 2,
        "System Architecture": 1
    },
    "projects": [
        {
            "title": {"en": "0x13. C - Advanced Math", "ar": "رياضيات متقدمة - لغة سي"},
            "directory_name": "0x13-advanced_math",
            "global_constraints": ["No standard libraries permitted"],
            "deadline": deadline_iso,
            "tasks": [
                {
                    "title": {"en": "Task 0: Binary Trees", "ar": "المهمة 0: الأشجار الثنائية"},
                    "task_type": "mandatory",
                    "skills_awarded": {"logic": 1000, "structures": 500},
                    "is_completed": True
                }
            ]
        }
    ]
}

db = database.SessionLocal()
try:
    payload = schemas.MacroSprintCreate.model_validate(macro_payload)
    sprint_data = payload.model_dump(exclude={"projects"})
    db_sprint = models.Sprint(**sprint_data)
    db.add(db_sprint)
    db.flush()
    print("Sprint flushed successfully.")

    for proj_in in payload.projects:
        proj_data = proj_in.model_dump(exclude={"tasks"})
        db_proj = models.Project(**proj_data, sprint_id=db_sprint.id)
        db.add(db_proj)
        db.flush()
        print(f"Project flushed. ID: {db_proj.id}")

        for task_in in proj_in.tasks:
            task_data = task_in.model_dump()
            db_task = models.Task(**task_data, project_id=db_proj.id)
            db.add(db_task)
            print("Task added.")

    db.commit()
    print("DB Commit successful.")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
