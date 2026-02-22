from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class DevEnvironmentBlock(Base):
    __tablename__ = "dev_environment_blocks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(JSON, nullable=True, default={"en": "", "ar": ""})
    description = Column(JSON, nullable=True, default={"en": "", "ar": ""})
    terminal_command = Column(String, nullable=True)


class Sprint(Base):
    __tablename__ = "sprints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(JSON, nullable=True, default={"en": "", "ar": ""})
    description = Column(JSON, nullable=True, default={"en": "", "ar": ""})
    skill_weights = Column(JSON, nullable=True, default={})

    projects = relationship("Project", back_populates="sprint", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    sprint_id = Column(Integer, ForeignKey("sprints.id"), nullable=False)
    title = Column(JSON, nullable=True, default={"en": "", "ar": ""})
    directory_name = Column(String, index=True)
    
    # JSON mapped columns for dynamic arrays (List[str])
    global_constraints = Column(JSON, nullable=True, default=[])
    forbidden_functions = Column(JSON, nullable=True, default=[])
    compiler_flags = Column(JSON, nullable=True, default=[])
    
    # Skill Mapping JSON mapped dictionary for XP calculation
    skill_tags = Column(JSON, nullable=True, default={})
    
    # Time Management string (ISO format mapping to UX deadlines)
    deadline = Column(String, nullable=True, default=None)

    sprint = relationship("Sprint", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(JSON, nullable=True, default={"en": "", "ar": ""})
    task_type = Column(String, index=True) # e.g., 'mandatory', 'advanced'
    
    # Dynamic arrays corresponding to List[str]
    allowed_syscalls = Column(JSON, nullable=True, default=[])

    # Bilingual Text columns
    technical_requirements = Column(JSON, nullable=True, default={"en": "", "ar": ""})
    example_main_code = Column(Text, nullable=True) # Usually raw code, no translation needed
    raw_terminal_output = Column(Text, nullable=True)
    
    # Skill Tree Mapping
    points = Column(Integer, default=10)
    
    is_completed = Column(Boolean, default=False)

    project = relationship("Project", back_populates="tasks")
