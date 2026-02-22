import requests

payload = {
  "title": {"en": "Low-Level Programming v2", "ar": "برمجة منخفضة المستوى"},
  "description": {"en": "Mastering the UNIX architecture", "ar": "إتقان بنية يونكس"},
  "skill_weights": {"C Language": 5, "Algorithms": 3, "Reverse Engineering": 4},
  "projects": [
    {
      "title": {"en": "0x09. C - Strace", "ar": "0x09. سي - تتبع النظام"},
      "directory_name": "0x09-strace",
      "deadline": "2026-03-01T23:59:59Z",
      "global_constraints": ["Allowed editors: vi, vim, emacs"],
      "forbidden_functions": ["printf", "puts"],
      "tasks": [
        {
          "title": {"en": "0. Syscall Name", "ar": "0. اسم استدعاء النظام"},
          "task_type": "mandatory",
          "allowed_syscalls": ["ptrace", "execve"],
          "technical_requirements": {"en": "Write a fundamental trace implementation.", "ar": "اكتب تنفيذ تتبع أساسي."},
          "example_main_code": "int main() { return 0; }",
          "raw_terminal_output": "execve = 0",
          "is_completed": False,
          "skills_awarded": {"C Language": 500, "Reverse Engineering": 800}
        }
      ]
    }
  ]
}

print(requests.post('http://localhost:8000/api/sprints/macro-inject', json=payload).json())
