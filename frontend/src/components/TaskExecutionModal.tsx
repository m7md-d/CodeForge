
import axios from 'axios';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function TaskExecutionModal({ task, onClose }: { task: any, onClose: () => void }) {
    const { getLocalizedText } = useLanguage();
    const queryClient = useQueryClient();

    const toggleCompletion = useMutation({
        mutationFn: async () => {
            return await api.put(`/tasks/${task.id}`, { ...task, is_completed: !task.is_completed });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sprints'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    if (!task) return null;

    const totalPoints = task.points || 0;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
            <div className="modal-content glass animate-fade" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative', borderLeft: task.is_completed ? '4px solid var(--neon-green)' : '4px solid var(--primary)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-main)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <i className="fa-solid fa-xmark"></i>
                </button>

                {/* Header Block */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: task.is_completed ? 'var(--neon-green)' : 'var(--primary)', marginBottom: '1rem', fontSize: '2rem', textDecoration: task.is_completed ? 'line-through' : 'none', transition: 'all 0.3s' }}>
                        {getLocalizedText(task.title)}
                    </h2>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="array-badge" style={{ background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }}>
                            {task.task_type.toUpperCase()}
                        </span>
                        {totalPoints > 0 && (
                            <span className="array-badge" style={{ background: 'rgba(255,183,3,0.1)', color: '#ffb703', borderColor: '#ffb703', fontWeight: 'bold' }}>
                                <i className="fa-solid fa-award"></i> {totalPoints} Pts
                            </span>
                        )}
                        {task.is_completed && (
                            <span className="array-badge animate-fade" style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--neon-green)', borderColor: 'var(--neon-green)', fontWeight: 'bold' }}>
                                <i className="fa-solid fa-check-double"></i> TERMINATED
                            </span>
                        )}
                    </div>
                </div>

                {/* Syscalls Bar */}
                {task.allowed_syscalls && task.allowed_syscalls.length > 0 && (
                    <div style={{ marginBottom: '2rem', padding: '1.25rem', background: 'rgba(57,255,20,0.05)', borderRadius: '8px', border: '1px solid rgba(57,255,20,0.2)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--neon-green)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}><i className="fa-solid fa-microchip"></i> Allowed Syscalls</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {task.allowed_syscalls.map((syscall: string) => (
                                <span key={syscall} className="array-badge" style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--neon-green)', borderColor: 'var(--neon-green)' }}>
                                    {syscall}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section A: The Briefing */}
                {task.technical_requirements && getLocalizedText(task.technical_requirements) && (
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-book-journal-whills"></i> The Briefing
                        </h3>
                        <div style={{ color: 'var(--text-muted)', lineHeight: '1.8', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', whiteSpace: 'pre-wrap', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {getLocalizedText(task.technical_requirements)}
                        </div>
                    </div>
                )}

                {/* Section B: The Intelligence (Code Block) */}
                {task.example_main_code && (
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ color: 'var(--primary-glow)', marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-code"></i> Expected Intelligence (main.c)
                        </h3>
                        <pre style={{ background: '#0d0d0d', padding: '1.5rem', borderRadius: '8px', color: '#d4d4d4', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', overflowX: 'auto', border: '1px solid #333', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {task.example_main_code}
                        </pre>
                    </div>
                )}

                {/* Section C: Expected Telemetry (Terminal) */}
                {task.raw_terminal_output && (
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ color: 'var(--neon-green)', marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-terminal"></i> Expected Telemetry
                        </h3>
                        <div className="terminal-output" style={{ background: '#050505', border: '1px solid #111', padding: '1.5rem', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5', boxShadow: 'inset 0 0 10px rgba(57,255,20,0.05)' }}>
                            {task.raw_terminal_output}
                        </div>
                    </div>
                )}

                {/* TERMINATION SYSTEM COMMAND */}
                <div style={{ marginTop: '3.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem' }}>
                    <button
                        onClick={() => toggleCompletion.mutate()}
                        disabled={toggleCompletion.isPending}
                        style={{
                            width: '100%',
                            padding: '1.5rem',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            border: task.is_completed ? '2px solid var(--danger)' : '2px solid var(--neon-green)',
                            background: task.is_completed ? 'rgba(255,0,84,0.1)' : 'rgba(57,255,20,0.1)',
                            color: task.is_completed ? 'var(--danger)' : 'var(--neon-green)',
                            transition: 'all 0.3s ease',
                            boxShadow: task.is_completed ? '0 0 15px rgba(255,0,84,0.2)' : '0 0 15px rgba(57,255,20,0.2)'
                        }}
                    >
                        {toggleCompletion.isPending ? <i className="fa-solid fa-spinner fa-spin"></i> :
                            task.is_completed ? <><i className="fa-solid fa-arrow-rotate-left"></i> REVERT TERMINATION</> : <><i className="fa-solid fa-bolt"></i> MARK TASK AS TERMINATED</>}
                    </button>
                    {!task.is_completed && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>Executing this action instantly integrates the task's points mathematically into the Skill Tree.</p>}
                </div>

            </div>
        </div>
    );
}
