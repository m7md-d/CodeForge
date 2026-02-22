import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

interface Task {
    id: number;
    title: { en: string; ar: string };
    task_type: string;
    points: number;
    is_completed: boolean;
}

interface Project {
    id: number;
    sprint_id: number;
    title: { en: string; ar: string };
    directory_name: string;
    deadline?: string;
    tasks: Task[];
}

interface Sprint {
    id: number;
    title: { en: string; ar: string };
    description: { en: string; ar: string } | null;
    projects: Project[];
}

export default function Dashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t, getLocalizedText, } = useLanguage();

    const [newSprintTitle, setNewSprintTitle] = useState('');
    const [activeSprintId, setActiveSprintId] = useState<number | null>(null);
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [newProjectDir, setNewProjectDir] = useState('');

    // Phase 11: Macro Injection State
    const [macroPayload, setMacroPayload] = useState('');

    const { data: sprints, isLoading, isError, error } = useQuery<Sprint[]>({
        queryKey: ['sprints'],
        queryFn: async () => {
            const res = await api.get('/sprints');
            return res.data;
        }
    });

    const createSprint = useMutation({
        mutationFn: async (title: string) => {
            const payload = {
                title: { en: title, ar: title },
                description: { en: "", ar: "" }
            };
            return await api.post('/sprints', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sprints'] });
            setNewSprintTitle('');
        }
    });

    const createProject = useMutation({
        mutationFn: async (payload: { sprintId: number, title: string, directory_name: string }) => {
            const body = {
                title: { en: payload.title, ar: payload.title },
                directory_name: payload.directory_name,
                global_constraints: [],
                forbidden_functions: [],
                compiler_flags: []
            };
            return await api.post(`/sprints/${payload.sprintId}/projects`, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sprints'] });
            setNewProjectTitle('');
            setNewProjectDir('');
            setActiveSprintId(null);
        }
    });

    // Phase 11: Macro Injection Mutation
    const injectMacro = useMutation({
        mutationFn: async (payload: any) => {
            return await api.post('/sprints/macro-inject', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sprints'] });
            setMacroPayload('');
            alert("Macro Payload Injected Successfully!");
        },
        onError: (err: any) => {
            alert(`Injection Failed: ${err.response?.data?.detail || err.message}`);
        }
    });

    const handleInjectMacro = () => {
        try {
            const parsed = JSON.parse(macroPayload);
            injectMacro.mutate(parsed);
        } catch (e) {
            alert("Invalid JSON format. Please check your payload.");
        }
    };

    const handleDownloadTemplate = () => {
        const template = {
            title: { en: "Sprint Title", ar: "عنوان السباق" },
            description: { en: "Sprint Description", ar: "وصف السباق" },
            skill_weights: {
                "C Language": 5,
                "Reverse Engineering": 3,
                "Algorithms": 2
            },
            projects: [
                {
                    title: { en: "Project Title", ar: "عنوان المشروع" },
                    directory_name: "0x00-hello_world",
                    deadline: new Date().toISOString(),
                    global_constraints: ["No standard lib"],
                    forbidden_functions: ["printf"],
                    compiler_flags: ["-Wall", "-Werror", "-Wextra", "-pedantic"],
                    skill_tags: { "C Programming": 0.5, "Logic": 0.5 },
                    tasks: [
                        {
                            title: { en: "Task 0", ar: "المهمة 0" },
                            task_type: "mandatory",
                            allowed_syscalls: ["write"],
                            technical_requirements: { en: "Must compile cleanly.", ar: "يجب أن يتم تجميعه بنجاح." },
                            example_main_code: "int main(void) {\n    return 0;\n}",
                            raw_terminal_output: "$ ./a.out\nHello",
                            points: 100
                        }
                    ]
                }
            ]
        };
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'codeforge_macro_template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const stats = useMemo(() => {
        let totalProjects = 0;
        let totalTasks = 0;
        let completedTasks = 0;
        let totalXP = 0;
        let activeStreak = 0;

        if (sprints && sprints.length > 0) {
            sprints.forEach(sprint => {
                totalProjects += sprint.projects.length;
                sprint.projects.forEach(project => {
                    totalTasks += project.tasks.length;
                    project.tasks.forEach(task => {
                        if (task.is_completed) {
                            completedTasks++;
                            totalXP += (task.points || 0);
                        }
                    });
                });
            });

            // Simple dynamic streak mapping if completed tasks exist
            if (completedTasks > 0) {
                activeStreak = Math.floor(completedTasks / 2) + 1; // Formulaic mock for true metrics
            }
        }

        let dynamicLevel = 1;
        let xpForNext = 500;

        if (totalXP > 0) {
            dynamicLevel = Math.floor(totalXP / 500) + 1;
            const remainder = totalXP % 500;
            xpForNext = 500 - remainder;
        }

        return { totalProjects, totalTasks, completedTasks, totalXP, dynamicLevel, xpForNext, activeStreak };
    }, [sprints]);

    // Animate progress bars on load natively mimicking the template
    useEffect(() => {
        if (!isLoading && sprints && sprints.length > 0) {
            const progressBars = document.querySelectorAll('.progress-bar');
            setTimeout(() => {
                progressBars.forEach((bar: Element) => {
                    const targetWidth = bar.getAttribute('data-target');
                    if (targetWidth) {
                        (bar as HTMLElement).style.width = targetWidth;
                    }
                });
            }, 100);
        }
    }, [isLoading, sprints]);

    if (isLoading) return <div style={{ padding: '2rem' }}>{t('loading')}</div>;
    if (isError) return <div className="glass" style={{ color: 'var(--danger)', padding: '2rem' }}>FATAL API ERROR: {(error as Error)?.message}. Check FastAPI logs.</div>;

    const isEmptyDatabase = !sprints || sprints.length === 0;

    return (
        <div>
            {/* The CodeForge Stat Grid */}
            <div className="stats-grid animate-fade delay-1">
                <div className="stat-card glass">
                    <i className="fa-solid fa-layer-group stat-icon"></i>
                    <div className="stat-info">
                        <h3>{t('levelLabel').replace('24', stats.dynamicLevel.toString())}</h3>
                        <p>{t('levelSub').replace('450', stats.xpForNext.toString())}</p>
                    </div>
                </div>
                <div className="stat-card glass">
                    <i className="fa-solid fa-bolt stat-icon" style={{ color: '#ffb703', textShadow: '0 0 15px #ffb703' }}></i>
                    <div className="stat-info">
                        <h3>{stats.totalXP.toLocaleString()}</h3>
                        <p>{t('totalXp')}</p>
                    </div>
                </div>
                <div className="stat-card glass">
                    <i className="fa-solid fa-fire stat-icon" style={{ color: 'var(--danger)', textShadow: '0 0 15px var(--danger)' }}></i>
                    <div className="stat-info">
                        <h3>{t('streakLabel').replace('14', stats.activeStreak.toString())}</h3>
                        <p>{t('streakSub')}</p>
                    </div>
                </div>
            </div>

            {/* Ingestion & Sprint Generation */}
            <div className="animate-fade delay-2" style={{ marginTop: '2.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title"><i className="fa-solid fa-server"></i> {t('sprintsDeployments')}</h2>
                <div style={{ display: 'flex', gap: '1rem', width: '300px' }}>
                    <input
                        type="text"
                        value={newSprintTitle}
                        onChange={(e) => setNewSprintTitle(e.target.value)}
                        placeholder={t('newSprintTitle')}
                    />
                    <button
                        className="primary"
                        onClick={() => { if (newSprintTitle) createSprint.mutate(newSprintTitle); }}
                        disabled={createSprint.isPending}
                    >
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>

            {isEmptyDatabase ? (
                <div className="glass animate-fade delay-3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary-glow)' }}><i className="fa-solid fa-database"></i> {t('noSprints')}</h3>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {sprints.map(sprint => (
                        <div key={sprint.id} className="animate-fade delay-3">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary-glow)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-folder-tree"></i> {getLocalizedText(sprint.title)}
                                </h3>
                                <button
                                    className="array-badge"
                                    style={{ cursor: 'pointer', border: '1px solid var(--accent)', background: 'transparent' }}
                                    onClick={() => setActiveSprintId(activeSprintId === sprint.id ? null : sprint.id)}>
                                    {activeSprintId === sprint.id ? t('close') : t('initProject')}
                                </button>
                            </div>

                            {/* Standard Project Initialization Dropdown */}
                            {activeSprintId === sprint.id && (
                                <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (newProjectTitle && newProjectDir) {
                                                createProject.mutate({ sprintId: sprint.id, title: newProjectTitle, directory_name: newProjectDir });
                                            }
                                        }}
                                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem' }}
                                    >
                                        <input
                                            type="text"
                                            value={newProjectTitle}
                                            onChange={e => setNewProjectTitle(e.target.value)}
                                            placeholder={t('projectNomen')}
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={newProjectDir}
                                            onChange={e => setNewProjectDir(e.target.value)}
                                            placeholder={t('dirMount')}
                                            required
                                            dir="ltr"
                                        />
                                        <button type="submit" className="primary" disabled={createProject.isPending}>
                                            <i className="fa-solid fa-upload"></i> {t('commitOrigin')}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Active Projects Grid */}
                            <h2 className="section-title" style={{ marginTop: '1rem' }}><i className="fa-solid fa-rocket"></i> {t('activeProjects')}</h2>

                            <div className="projects-grid">
                                {sprint.projects.map(project => {
                                    const completed = project.tasks.filter(t => t.is_completed).length;
                                    const total = project.tasks.length;
                                    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                                    // Cycle through some accent styles just to simulate the template aesthetics
                                    const isPy = project.directory_name.includes('python');
                                    const isTeam = project.directory_name.includes('airbnb') || project.directory_name.includes('maze');

                                    let tagStyle = {};
                                    let barStyle = {};
                                    if (isPy) {
                                        tagStyle = { color: '#ffd166', background: 'rgba(255, 209, 102, 0.1)', borderColor: '#ffd166' };
                                        barStyle = { background: 'linear-gradient(90deg, #ffd166, #ef476f)', boxShadow: '0 0 10px #ffd166' };
                                    } else if (isTeam) {
                                        tagStyle = { color: '#ef476f', background: 'rgba(239, 71, 111, 0.1)', borderColor: '#ef476f' };
                                        barStyle = { background: 'linear-gradient(90deg, #ef476f, var(--primary))', boxShadow: '0 0 10px #ef476f' };
                                    }

                                    return (
                                        <div
                                            key={project.id}
                                            className="project-card glass"
                                            onClick={() => navigate(`/project/${project.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="project-header">
                                                <h3 className="project-title">{getLocalizedText(project.title)}</h3>
                                                <span className="project-tag" style={tagStyle}>
                                                    {isPy ? 'Python' : isTeam ? 'Team Project' : 'C Language'}
                                                </span>
                                            </div>
                                            <div className="progress-container">
                                                <div
                                                    className="progress-bar"
                                                    data-target={`${percentage}%`}
                                                    style={{ width: '0%', ...barStyle }}
                                                ></div>
                                            </div>
                                            <div className="project-footer">
                                                <span><i className="fa-regular fa-clock"></i> {project.deadline ? new Date(project.deadline).toLocaleString() : t('noneSet')}</span>
                                                <span>{percentage}% {t('completedSuffix')}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {sprint.projects.length === 0 && (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                                        {t('noProjects')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Phase 11: Macro JSON Injection Engine */}
            <div className="glass animate-fade delay-3" style={{ marginTop: '4rem', padding: '2rem', borderTop: '4px solid var(--primary)' }}>
                <h2 style={{ color: 'var(--primary-glow)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-code-commit"></i> INJECT MACRO PAYLOAD (SPRINT + PROJECTS + TASKS)
                </h2>
                <textarea
                    rows={12}
                    value={macroPayload}
                    onChange={(e) => setMacroPayload(e.target.value)}
                    placeholder="Paste strict JSON payload here..."
                    style={{ fontFamily: 'monospace', width: '100%', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.5)', color: 'var(--accent)', border: '1px solid var(--panel-border)' }}
                    dir="ltr"
                ></textarea>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="primary"
                        onClick={handleInjectMacro}
                        disabled={injectMacro.isPending || !macroPayload.trim()}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <i className="fa-solid fa-satellite-dish"></i> Execute Injection
                    </button>
                    <button
                        onClick={handleDownloadTemplate}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid var(--panel-border)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' }}
                    >
                        <i className="fa-solid fa-download"></i> Download JSON Template
                    </button>
                </div>
            </div>

        </div>
    );
}
