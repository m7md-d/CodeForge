import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import OmniEditModal from './OmniEditModal';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function ProjectsArchive() {
    const { t, getLocalizedText } = useLanguage();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [editTarget, setEditTarget] = React.useState<{ endpoint: string, item: any } | null>(null);

    const deleteMutation = useMutation({
        mutationFn: async ({ endpoint, id }: { endpoint: string, id: number }) => {
            return await api.delete(`/${endpoint}/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sprints'] }),
        onError: (err: any) => alert("Deletion Error: " + err.message)
    });

    const { data: sprints, isLoading, isError, error } = useQuery<any[]>({
        queryKey: ['sprints'],
        queryFn: async () => (await api.get('/sprints')).data
    });

    if (isLoading) return <div style={{ padding: '2rem' }}>{t('loading')}</div>;
    if (isError) return <div className="glass" style={{ color: 'var(--danger)', padding: '2rem' }}>Error: {(error as Error).message}</div>;

    return (
        <div className="animate-fade">
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-code-branch"></i> {t('navProjects') || "Projects Archive"}
            </h2>

            <input
                type="text"
                placeholder="Search repository structure..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', maxWidth: '600px', marginBottom: '2rem' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {sprints?.map(sprint => {
                    const filteredProjects = sprint.projects.filter((p: any) =>
                        getLocalizedText(p.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.directory_name.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredProjects.length === 0) return null;

                    return (
                        <div key={sprint.id} className="sprint-group">
                            <h3 style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span><i className="fa-solid fa-layer-group"></i> {getLocalizedText(sprint.title)}</span>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={() => setEditTarget({ endpoint: 'sprints', item: sprint })} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}><i className="fa-solid fa-pencil"></i></button>
                                    <button onClick={() => window.confirm('Purge absolute Sprint hierarchy and all nested data?') && deleteMutation.mutate({ endpoint: 'sprints', id: sprint.id })} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1rem' }}><i className="fa-solid fa-trash"></i></button>
                                </div>
                            </h3>
                            <div className="projects-grid">
                                {filteredProjects.map((project: any) => {
                                    let totalXP = 0;
                                    let earnedXP = 0;

                                    project.tasks.forEach((t: any) => {
                                        const pts = t.points || 0;
                                        totalXP += pts;
                                        if (t.is_completed) earnedXP += pts;
                                    });

                                    const progress = totalXP > 0 ? Math.round((earnedXP / totalXP) * 100) : 0;

                                    return (
                                        <div key={project.id} className="project-card glass" onClick={() => navigate(`/project/${project.id}`)} style={{ cursor: 'pointer' }}>
                                            <div className="project-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h3 className="project-title">{getLocalizedText(project.title)}</h3>
                                                    <span className="project-tag" style={{ border: 'none', background: 'transparent' }}>
                                                        {project.directory_name}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }} onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => setEditTarget({ endpoint: 'projects', item: project })} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}><i className="fa-solid fa-pencil"></i></button>
                                                    <button onClick={() => window.confirm('Purge Project permanently?') && deleteMutation.mutate({ endpoint: 'projects', id: project.id })} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}><i className="fa-solid fa-trash"></i></button>
                                                </div>
                                            </div>
                                            <div className="progress-container">
                                                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <div className="project-footer">
                                                <span><i className="fa-regular fa-clock"></i> {project.deadline ? new Date(project.deadline).toLocaleString() : t('noneSet')}</span>
                                                <span style={{ color: progress === 100 ? 'var(--neon-green)' : 'inherit' }}>{progress}% XP Acquired</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Omni-Modal Binding */}
            {editTarget && <OmniEditModal endpoint={editTarget.endpoint} item={editTarget.item} onClose={() => setEditTarget(null)} />}
        </div>
    );
}
