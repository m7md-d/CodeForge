# CodeForge: JSON Macro-Injection Schema Matrix

The CodeForge Application possesses an internal Macro-Injection compiler utilizing the POST `/api/sprints/macro-inject` endpoint. It expects deeply nested JSON mapped precisely to the underlying SQLAlchemy database bounds.

To rapidly populate curriculums, Projects, and Task telemetry, copy the **System Prompt** below and supply it to Large Language Models (ChatGPT, Claude, etc). The resulting JSON output can then be directly pasted into the CodeForge JSON UI.

---

### The System Prompt (For LLMs)

**Copy the text below entirely and provide it to your preferred LLM:**

> You are an expert Curriculum Engineer. Construct a highly detailed module in JSON format ONLY. 
> Strict Requirement: Do not write any markdown outside the raw JSON object. Do not preface the JSON with ```json. Map all textual elements dynamically to a bilingual payload `{"en": "English", "ar": "Arabic translation"}`. 
> Follow this exact JSON matrix layout perfectly:
> 
> {
>   "title": {"en": "Sprint 1", "ar": "السباق ١"},
>   "description": {"en": "Initial Phase", "ar": "المرحلة الأولى"},
>   "skill_weights": {"Logic": 10, "C": 5},
>   "projects": [
>     {
>       "title": {"en": "Project 0x00", "ar": "المشروع ٠"},
>       "directory_name": "0x00-hello_world",
>       "deadline": "2026-12-31T23:59:59Z",
>       "global_constraints": ["No standard libraries"],
>       "forbidden_functions": ["printf"],
>       "compiler_flags": ["-Wall", "-Werror", "-Wextra", "-pedantic"],
>       "skill_tags": {"C Programming": 0.5, "Logic": 0.5},
>       "tasks": [
>         {
>           "title": {"en": "Task 0", "ar": "المهمة ٠"},
>           "task_type": "mandatory",
>           "allowed_syscalls": ["write"],
>           "technical_requirements": {"en": "Must compile cleanly.", "ar": "يجب تجميعه بنجاح."},
>           "example_main_code": "int main(void) {\n    return 0;\n}",
>           "raw_terminal_output": "$ ./a.out\nHello",
>           "points": 100
>         }
>       ]
>     }
>   ]
> }
> 
> Build the payload modeling [Your Desired Topic Here, e.g. "Advanced pointers in C" or "React Query basics"].

---

#### 📌 Schema Overrides to remember:
* `skill_tags`: A JSON dictionary mapping relative XP distributions at the **Project Tier**. Must ideally equal `1.0` if tallied to calculate true division.
* `points`: A flat Integer value defining the raw XP provided inside an individual **Task**.
* `task_type`: An enumerated string, either `"mandatory"` or `"advanced"`.
