import sys
sys.path.append("/Users/dark_mac/Projects/Holberton_Clone/Holberton_clone/backend")
from main import macro_inject_sprint
from database import SessionLocal
import schemas

payload = schemas.MacroSprintCreate(
  title={"en": "Low-Level Programming v2", "ar": "برمجة منخفضة المستوى"},
  description={"en": "Mastering the UNIX architecture", "ar": "إتقان بنية يونكس"},
  skill_weights={"C Language": 5, "Algorithms": 3},
  projects=[
    schemas.MacroProjectCreate(
      title={"en": "0x09. C - Strace", "ar": "0x09. سي - تتبع النظام"},
      directory_name="0x09-strace",
      deadline="2026-03-01T23:59:59Z",
      global_constraints=["Allowed editors: vi, vim, emacs"],
      forbidden_functions=["printf", "puts"],
      tasks=[
        schemas.TaskCreate(
          title={"en": "0. Syscall Name", "ar": "0. اسم استدعاء النظام"},
          task_type="mandatory",
          allowed_syscalls=["ptrace", "execve"],
          technical_requirements={"en": "Write a fundamental trace implementation.", "ar": "اكتب تنفيذ تتبع أساسي."},
          example_main_code="int main() { return 0; }",
          raw_terminal_output="execve = 0",
          is_completed=False,
          skills_awarded={"C Language": 500}
        )
      ]
    )
  ]
)

db = SessionLocal()
try:
    print(macro_inject_sprint(payload, db))
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
