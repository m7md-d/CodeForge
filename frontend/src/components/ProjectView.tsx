import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import JSONInjector from './JSONInjector';
import TaskExecutionModal from './TaskExecutionModal';
import OmniEditModal from './OmniEditModal';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

interface Task {
    id: number;
    title: { en: string; ar: string };
    task_type: string;
    allowed_syscalls: string[];
    technical_requirements: { en: string; ar: string } | null;
    example_main_code: string | null;
    raw_terminal_output: string | null;
    points: number;
    is_completed: boolean;
}

interface Project {
    id: number;
    title: { en: string; ar: string };
    directory_name: string;
    global_constraints: string[];
    forbidden_functions: string[];
    compiler_flags: string[];
    skill_tags: Record<string, number> | null;
    tasks: Task[];
}

export default function ProjectView() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t, getLocalizedText } = useLanguage();

    const [isInjecting, setIsInjecting] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [editTarget, setEditTarget] = useState<{ endpoint: string, item: any } | null>(null);

    const deleteMutation = useMutation({
        mutationFn: async ({ endpoint, id }: { endpoint: string, id: number }) => {
            return await api.delete(`/${endpoint}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
            queryClient.invalidateQueries({ queryKey: ['sprints'] });
        },
        onError: (err: any) => alert("Deletion Error: " + err.message)
    });

    const { data: project, isLoading, isError, error } = useQuery<Project>({
        queryKey: ['projects', projectId],
        queryFn: async () => {
            const res = await api.get(`/projects/${projectId}`);
            return res.data;
        },
        enabled: !!projectId
    });

    const toggleCompletion = useMutation({
        mutationFn: async (task: Task) => {
            return await api.put(`/tasks/${task.id}`, {
                title: task.title,
                task_type: task.task_type,
                allowed_syscalls: task.allowed_syscalls,
                technical_requirements: task.technical_requirements,
                example_main_code: task.example_main_code,
                raw_terminal_output: task.raw_terminal_output,
                points: task.points,
                is_completed: !task.is_completed
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
            queryClient.invalidateQueries({ queryKey: ['sprints'] });
        }
    });

    const handleDownloadTemplate = () => {
        const template = {
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
        };
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project_${projectId}_tasks_template.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };



    // Native bar animation mirror
    useEffect(() => {
        if (project && project.tasks) {
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
    }, [project]);

    if (isLoading) return <div style={{ padding: '2rem', color: 'var(--accent)' }}>{t('loading')}</div>;
    if (isError) return <div className="glass" style={{ color: 'var(--danger)', padding: '2rem' }}>FATAL API ERROR: {(error as Error)?.message}. Check FastAPI logs.</div>;
    if (!project) return null;

    const completedTasks = project.tasks ? project.tasks.filter(t => t.is_completed).length : 0;
    const progressPercent = project.tasks && project.tasks.length > 0 ? Math.round((completedTasks / project.tasks.length) * 100) : 0;

    return (
        <div>

            {/* Macro Navigation Block - Using CodeForge style bounds */}
            <div className="animate-fade delay-1" style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', marginBottom: '1rem', fontSize: '1rem' }}
                >
                    <i className="fa-solid fa-arrow-right-long"></i> {t('abortTelemetry')}
                </button>
                <div className="project-card glass" style={{ transform: 'none' }}>
                    <div className="project-header">
                        <h2 className="project-title" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fa-solid fa-rocket" style={{ color: 'var(--primary-glow)' }}></i> {getLocalizedText(project.title)}
                        </h2>
                        <span className="project-tag" style={{ border: 'none', background: 'transparent' }}>
                            {progressPercent}% {t('sequenceProgress')}
                        </span>
                    </div>
                    <div className="progress-container">
                        <div className="progress-bar" data-target={`${progressPercent}%`} style={{ width: '0%' }}></div>
                    </div>
                    <div className="project-footer">
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            $ cd {project.directory_name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Global Project Constraints Card */}
            <div className="glass animate-fade delay-2" style={{ padding: '1.5rem', marginBottom: '2.5rem', borderLeft: '4px solid var(--primary-glow)' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>{t('globalHeuristics')}</h3>

                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('flags')}</div>
                        {project.compiler_flags?.length ? project.compiler_flags.map(f => (
                            <span key={f} className="array-badge">{f}</span>
                        )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('noneSet')}</span>}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('restrictedDomains')}</div>
                        {project.forbidden_functions?.length ? project.forbidden_functions.map(f => (
                            <span key={f} className="array-badge" style={{ color: 'var(--danger)', borderColor: 'rgba(255,0,84,0.3)', background: 'rgba(255,0,84,0.1)' }}>{f}</span>
                        )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('noneSet')}</span>}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('enforcedParadigms')}</div>
                        {project.global_constraints?.length ? project.global_constraints.map(c => (
                            <span key={c} className="array-badge">{c}</span>
                        )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('noneSet')}</span>}
                    </div>
                </div>
            </div>

            {/* Task View Checkers */}
            <div className="animate-fade delay-3">
                <h2 className="section-title"><i className="fa-solid fa-list-check"></i> {t('tasksTitle')}</h2>

                <div className="tasks-list">
                    {project.tasks && project.tasks.map(task => {

                        // Absolute XP mathematically resolved
                        const totalPoints = task.points || 0;

                        return (
                            <div
                                key={task.id}
                                className={`task-item glass ${task.is_completed ? 'completed' : ''}`}
                                onClick={() => setSelectedTask(task)}
                                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div className="task-info" style={{ flex: 1 }}>
                                    <div className="checker" onClick={(e) => { e.stopPropagation(); toggleCompletion.mutate(task); }}></div>
                                    <div>
                                        <div className="task-name" style={{ color: 'var(--primary-glow)' }}>{getLocalizedText(task.title)}</div>
                                        <span className="task-meta" style={{ color: task.task_type === 'advanced' ? '#ffd166' : 'var(--text-muted)' }}>
                                            {task.task_type === 'advanced' ? t('advancedLabel') : t('mandatoryLabel')}
                                        </span>
                                    </div>
                                </div>

                                <div className="task-points" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {totalPoints > 0 && <div className="task-points" style={{ color: '#ffb703', fontWeight: 'bold', letterSpacing: '1px' }}>{totalPoints} Pts</div>}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditTarget({ endpoint: 'tasks', item: task }); }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', transition: '0.2s' }}
                                        title="Surgically Override Schema"
                                    >
                                        <i className="fa-solid fa-pen-nib" style={{ textShadow: '0 0 10px rgba(157, 78, 221, 0.5)' }}></i>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); window.confirm('Purge Task permanently?') && deleteMutation.mutate({ endpoint: 'tasks', id: task.id }); }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem', transition: '0.2s' }}
                                        title="Obliterate Task"
                                    >
                                        <i className="fa-solid fa-trash" style={{ textShadow: '0 0 10px rgba(255, 0, 84, 0.5)' }}></i>
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                    {(!project.tasks || project.tasks.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            {t('noObjectives')}
                        </div>
                    )}
                </div>
            </div>

            {/* Ingestion Engine Accordion */}
            <div className="animate-fade delay-3" style={{ marginTop: '3rem' }}>
                <button
                    onClick={() => setIsInjecting(!isInjecting)}
                    className={isInjecting ? "glass" : "primary"}
                    style={{ width: '100%', padding: '1rem', letterSpacing: '1px', fontSize: '1rem', cursor: 'pointer', border: isInjecting ? '1px solid var(--panel-border)' : 'none' }}
                >
                    <i className={isInjecting ? "fa-solid fa-minus" : "fa-solid fa-plus-circle"}></i> {isInjecting ? t('terminateUplink') : t('establishUplink')}
                </button>

                {isInjecting && (
                    <div style={{ marginTop: '1rem' }} className="glass animate-fade">
                        <JSONInjector projectId={project.id} onSuccessCallback={() => setIsInjecting(false)} />

                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <button
                                onClick={handleDownloadTemplate}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid var(--panel-border)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' }}
                            >
                                <i className="fa-solid fa-download"></i> Download Task Array JSON Template
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Final Executable Modal Hooks */}
            {selectedTask && <TaskExecutionModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
            {editTarget && <OmniEditModal endpoint={editTarget.endpoint} item={editTarget.item} onClose={() => setEditTarget(null)} />}

        </div>
    );
}
