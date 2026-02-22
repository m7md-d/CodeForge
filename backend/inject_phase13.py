import requests
from datetime import datetime, timedelta

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
                },
                {
                    "title": {"en": "Task 1: Red-Black Trees", "ar": "المهمة 1: الأشجار الحمراء والسوداء"},
                    "task_type": "advanced",
                    "skills_awarded": {"logic": 2000, "algorithms": 1500},
                    "is_completed": False
                }
            ]
        },
        {
            "title": {"en": "0x14. C - Assembly & ELF", "ar": "التجميع و ELF - لغة سي"},
            "directory_name": "0x14-assembly_elf",
            "deadline": (datetime.now() + timedelta(days=14)).isoformat(),
            "tasks": [
                {
                    "title": {"en": "Task 0: Crackme", "ar": "المهمة 0: اختراق"},
                    "task_type": "mandatory",
                    "skills_awarded": {"reverse_engineering": 2000},
                    "is_completed": True
                }
            ]
        }
    ]
}

response = requests.post("http://localhost:8000/api/sprints/macro-inject", json=macro_payload)
print(f"Status Code: {response.status_code}")
print(response.text)
