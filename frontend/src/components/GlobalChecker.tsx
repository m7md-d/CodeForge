import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import TaskExecutionModal from './TaskExecutionModal';
import OmniEditModal from './OmniEditModal';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function GlobalChecker() {
    const { t, getLocalizedText } = useLanguage();
    const queryClient = useQueryClient();

    const { data: sprints, isLoading, isError, error } = useQuery<any[]>({
        queryKey: ['sprints'],
        queryFn: async () => (await api.get('/sprints')).data
    });

    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [editTarget, setEditTarget] = useState<{ endpoint: string, item: any } | null>(null);

    const deleteMutation = useMutation({
        mutationFn: async ({ endpoint, id }: { endpoint: string, id: number }) => {
            return await api.delete(`/${endpoint}/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sprints'] }),
        onError: (err: any) => alert("Deletion Error: " + err.message)
    });

    const toggleCompletion = useMutation({
        mutationFn: async (task: any) => {
            return await api.put(`/tasks/${task.id}`, { ...task, is_completed: !task.is_completed });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sprints'] })
    });

    if (isLoading) return <div style={{ padding: '2rem' }}>{t('loading') || "Loading Telemetry..."}</div>;
    if (isError) return <div className="glass" style={{ color: 'var(--danger)', padding: '2rem' }}>Error: {(error as Error).message}</div>;

    const renderTaskList = (tasks: any[]) => (
        <div className="tasks-list">
            {tasks.map(task => {
                const totalPoints = task.points || 0;
                return (
                    <div key={task.id} className={`task-item glass ${task.is_completed ? 'completed' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="task-info" onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer', flex: 1 }}>
                            <div className="checker" onClick={(e) => { e.stopPropagation(); toggleCompletion.mutate(task); }}></div>
                            <div>
                                <div className="task-name" style={{ color: 'var(--primary-glow)' }}>{getLocalizedText(task.title)}</div>
                                <span className="task-meta">{task.task_type.toUpperCase()}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginLeft: '1rem', alignItems: 'center' }}>
                            {totalPoints > 0 && <div className="task-points" style={{ color: '#ffb703', fontWeight: 'bold', letterSpacing: '1px' }}>{totalPoints} Pts</div>}
                            <button onClick={(e) => { e.stopPropagation(); setEditTarget({ endpoint: 'tasks', item: task }); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}><i className="fa-solid fa-pen-nib"></i></button>
                            <button onClick={(e) => { e.stopPropagation(); window.confirm('Purge Task permanently?') && deleteMutation.mutate({ endpoint: 'tasks', id: task.id }); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem' }}><i className="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                )
            })}
        </div>
    );

    return (
        <div className="animate-fade">
            <h2 className="section-title" style={{ marginBottom: '2rem' }}>
                <i className="fa-solid fa-list-check"></i> {t('navChecker') || "Auto-Checker Matrix"}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                {sprints?.map(sprint => {
                    const sprintTasks = sprint.projects.flatMap((p: any) => p.tasks) || [];
                    const pendingTasks = sprintTasks.filter((t: any) => !t.is_completed);
                    const completedTasks = sprintTasks.filter((t: any) => t.is_completed);

                    if (sprintTasks.length === 0) return null;

                    return (
                        <div key={sprint.id} className="sprint-checker-block">
                            <h3 style={{ fontSize: '1.3rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{getLocalizedText(sprint.title)}</span>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={() => setEditTarget({ endpoint: 'sprints', item: sprint })} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}><i className="fa-solid fa-pencil"></i></button>
                                    <button onClick={() => window.confirm('Purge absolute Sprint hierarchy and all nested data?') && deleteMutation.mutate({ endpoint: 'sprints', id: sprint.id })} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1rem' }}><i className="fa-solid fa-trash"></i></button>
                                </div>
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--danger)', borderBottom: '1px solid rgba(255,0,84,0.3)', paddingBottom: '0.5rem' }}>
                                        <i className="fa-solid fa-spinner"></i> Pending ({pendingTasks.length})
                                    </h4>
                                    {pendingTasks.length > 0 ? renderTaskList(pendingTasks) : <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All clean.</div>}
                                </div>

                                <div>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--success)', borderBottom: '1px solid rgba(0,250,146,0.3)', paddingBottom: '0.5rem' }}>
                                        <i className="fa-solid fa-check-double"></i> Terminated ({completedTasks.length})
                                    </h4>
                                    {completedTasks.length > 0 ? renderTaskList(completedTasks) : <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Awaiting execution.</div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Omni-Modal Bindings */}
            {selectedTask && <TaskExecutionModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
            {editTarget && <OmniEditModal endpoint={editTarget.endpoint} item={editTarget.item} onClose={() => setEditTarget(null)} />}
        </div>
    );
}
