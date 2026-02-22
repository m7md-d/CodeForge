import { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function Profile() {
    const { t, language, toggleLanguage } = useLanguage();

    const { data: sprints, isLoading } = useQuery<any[]>({
        queryKey: ['sprints'],
        queryFn: async () => (await api.get('/sprints')).data
    });

    const stats = useMemo(() => {
        let totalXP = 0;
        let completedTasks = 0;
        const skillTree: Record<string, number> = {};

        if (sprints && sprints.length > 0) {
            sprints.forEach(sprint => {
                sprint.projects.forEach((project: any) => {
                    let projectEarnedXP = 0;

                    project.tasks.forEach((task: any) => {
                        if (task.is_completed) {
                            completedTasks++;
                            projectEarnedXP += (task.points || 0);
                            totalXP += (task.points || 0);
                        }
                    });

                    // Phase 16: Project-Level Skill Tag Mapping Math
                    if (project.skill_tags && projectEarnedXP > 0) {
                        const totalWeight = Object.values(project.skill_tags).reduce((a: any, b: any) => a + b, 0) as number;
                        if (totalWeight > 0) {
                            Object.entries(project.skill_tags).forEach(([skill, weight]) => {
                                const ratio = (weight as number) / totalWeight;
                                skillTree[skill] = (skillTree[skill] || 0) + Math.round(projectEarnedXP * ratio);
                            });
                        }
                    }
                });
            });
        }

        const dynamicLevel = totalXP > 0 ? Math.floor(totalXP / 500) + 1 : 1;
        const streak = completedTasks > 0 ? Math.floor(completedTasks / 2) + 1 : 0;

        return { totalXP, dynamicLevel, streak, skillTree };
    }, [sprints]);

    const handlePurge = async () => {
        if (window.confirm("WARNING: This will natively DROP all SQLite tables and wipe local storage. Proceed?")) {
            try {
                await api.delete('/system/purge');
                localStorage.clear();
                window.location.reload();
            } catch (err) {
                alert("Failed to execute native purge protocol.");
            }
        }
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>{t('loading') || "Gathering Telemetry..."}</div>;

    return (
        <div className="animate-fade">
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-user-shield"></i> {t('navProfile') || "Engineering Profile"}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', marginBottom: '2rem' }}>
                {/* ID Card */}
                <div className="glass" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                    <div style={{ fontSize: '4rem', color: 'var(--primary-glow)' }}><i className="fa-solid fa-user-astronaut"></i></div>
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{t('systemUser') || "System Admin"}</h3>
                    <div className="array-badge">Level {stats.dynamicLevel} Engineer</div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-bolt"></i> Total XP</span>
                            <span style={{ color: '#ffb703', fontWeight: 'bold' }}>{stats.totalXP.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-fire"></i> Active Streak</span>
                            <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{stats.streak} Days</span>
                        </div>
                    </div>
                </div>

                {/* Skill Radar / Tree */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}><i className="fa-solid fa-network-wired"></i> Distributed Skill Matrix</h3>
                    {Object.keys(stats.skillTree).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {Object.entries(stats.skillTree).sort((a, b) => b[1] - a[1]).map(([skill, xp]) => {
                                const maxSkillXP = Math.max(...Object.values(stats.skillTree));
                                const percentage = maxSkillXP > 0 ? Math.round((xp / maxSkillXP) * 100) : 0;
                                return (
                                    <div key={skill}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                                            <span>{skill}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>{xp.toLocaleString()} XP</span>
                                        </div>
                                        <div className="progress-container" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                            <div className="progress-bar" style={{ width: `${percentage}%`, background: 'var(--neon-green)' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                            <i className="fa-solid fa-microchip" style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                            <p>No telemetry available. Complete tasks to map algorithmic growth.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Settings Block */}
            <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}><i className="fa-solid fa-sliders"></i> System Parameters</h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Global Locale Calibration</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '5px' }}>Toggle UI mapping between imperial [en] and arabic RTL [ar].</div>
                    </div>
                    <button onClick={toggleLanguage} className="primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fa-solid fa-globe"></i> {language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,0,84,0.1)', border: '1px solid rgba(255,0,84,0.3)', borderRadius: '8px' }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--danger)' }}>Purge Core SQLite Persistence</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '5px' }}>Executes a cascading Table DROP via SQLAlchemy and flushes browser state.</div>
                    </div>
                    <button onClick={handlePurge} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <i className="fa-solid fa-skull"></i> EXECUTE PURGE
                    </button>
                </div>
            </div>
        </div>
    );
}
