import requests
from datetime import datetime, timedelta

deadline_iso = (datetime.utcnow() + timedelta(days=2)).isoformat()

macro_payload = {
    "title": {"en": "Low-level Systems Sprint", "ar": "سباق الأنظمة منخفضة المستوى"},
    "description": {"en": "Phase 10 Verify", "ar": "تحقق المرحلة 10"},
    "projects": [
        {
            "title": {"en": "0x0A. C - Time Management", "ar": "إدارة الوقت - لغة سي"},
            "directory_name": "0x0a-time_management",
            "global_constraints": ["No standard lib", "Use ISO strings"],
            "deadline": deadline_iso,
            "tasks": [
                {
                    "title": {"en": "Task 0: Basics", "ar": "المهمة 0: الأساسيات"},
                    "task_type": "mandatory",
                    "skills_awarded": {"c_lang": 1500, "logic": 500},
                    "is_completed": True
                },
                {
                    "title": {"en": "Task 1: Advanced", "ar": "المهمة 1: متقدم"},
                    "task_type": "advanced",
                    "skills_awarded": {"c_lang": 3000, "algorithms": 1200},
                    "is_completed": False
                }
            ]
        }
    ]
}

res = requests.post("http://localhost:8000/api/sprints/macro-inject", json=macro_payload)
print(res.status_code)
print(res.json())
