import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function DevEnvironment() {
    const { t, getLocalizedText } = useLanguage();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [titleEn, setTitleEn] = useState('');
    const [titleAr, setTitleAr] = useState('');
    const [descEn, setDescEn] = useState('');
    const [descAr, setDescAr] = useState('');
    const [terminalCmd, setTerminalCmd] = useState('');

    const { data: blocks, isLoading, isError } = useQuery<any[]>({
        queryKey: ['environment'],
        queryFn: async () => (await api.get('/environment')).data
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                title: { en: titleEn, ar: titleAr },
                description: { en: descEn, ar: descAr },
                terminal_command: terminalCmd
            };
            return await api.post('/environment', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['environment'] });
            resetForm();
            setIsCreating(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (id: number) => {
            const payload = {
                title: { en: titleEn, ar: titleAr },
                description: { en: descEn, ar: descAr },
                terminal_command: terminalCmd
            };
            return await api.put(`/environment/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['environment'] });
            resetForm();
            setIsEditing(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return await api.delete(`/environment/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['environment'] });
        }
    });

    const resetForm = () => {
        setTitleEn('');
        setTitleAr('');
        setDescEn('');
        setDescAr('');
        setTerminalCmd('');
    };

    const handleEditClick = (block: any) => {
        setIsEditing(block.id);
        setTitleEn(block.title?.en || '');
        setTitleAr(block.title?.ar || '');
        setDescEn(block.description?.en || '');
        setDescAr(block.description?.ar || '');
        setTerminalCmd(block.terminal_command || '');
        setIsCreating(false);
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>Loading Environment Matrix...</div>;
    if (isError) return <div className="glass" style={{ color: 'var(--danger)', padding: '2rem' }}>FATAL DB ERROR.</div>;

    const inputStyle = { width: '100%', padding: '0.75rem', color: 'var(--neon-green)', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(57,255,20,0.2)', borderRadius: '4px', outline: 'none', marginBottom: '1rem', fontFamily: 'monospace' };

    return (
        <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="section-title" style={{ margin: 0 }}>
                    <i className="fa-solid fa-terminal"></i> {t('navDevEnv') || "Development Environment"}
                </h2>
                <button
                    className="primary"
                    onClick={() => { resetForm(); setIsCreating(!isCreating); setIsEditing(null); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <i className={isCreating ? "fa-solid fa-xmark" : "fa-solid fa-plus"}></i> {isCreating ? 'CANCEL' : 'DEPLOY NEW STACK'}
                </button>
            </div>

            {/* Creation / Edit Form */}
            {(isCreating || isEditing) && (
                <div className="glass animate-fade delay-1" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--primary-glow)' }}>
                    <h3 style={{ color: 'var(--primary-glow)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fa-solid fa-microchip"></i> {isEditing ? 'MODIFY ENVIRONMENT STACK' : 'PROVISION ENVIRONMENT STACK'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Header [EN]</label>
                            <input value={titleEn} onChange={e => setTitleEn(e.target.value)} style={inputStyle} placeholder="e.g. Memory Diagnostics" />

                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Briefing [EN]</label>
                            <textarea rows={4} value={descEn} onChange={e => setDescEn(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Explain toolchain..." />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Header [AR]</label>
                            <input dir="rtl" value={titleAr} onChange={e => setTitleAr(e.target.value)} style={{ ...inputStyle, color: '#ffb703', borderColor: 'rgba(255,183,3,0.2)' }} placeholder="عنوان التشخيص" />

                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Briefing [AR]</label>
                            <textarea dir="rtl" rows={4} value={descAr} onChange={e => setDescAr(e.target.value)} style={{ ...inputStyle, color: '#ffb703', borderColor: 'rgba(255,183,3,0.2)', resize: 'vertical' }} placeholder="اشرح الأداة..." />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Expected Terminal Telemetry Command</label>
                        <input value={terminalCmd} onChange={e => setTerminalCmd(e.target.value)} style={{ ...inputStyle, color: 'var(--text-main)', background: '#09090b', borderColor: '#333' }} placeholder="$ valgrind --leak-check=full ./exec" />
                    </div>

                    <button
                        onClick={() => isEditing ? updateMutation.mutate(isEditing) : createMutation.mutate()}
                        disabled={createMutation.isPending || updateMutation.isPending}
                        style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '2px', marginTop: '1rem' }}
                    >
                        {isEditing ? 'COMMIT MODIFICATION' : 'PROVISION STACK'}
                    </button>
                </div>
            )}

            {/* Dynamic Rendering Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
                {blocks?.map((block: any, index: number) => {
                    const colors = ['var(--accent)', '#ffb703', 'var(--danger)', 'var(--neon-pink)'];
                    const color = colors[index % colors.length];

                    return (
                        <div key={block.id} className="glass animate-fade delay-2" style={{ padding: '2rem', borderLeft: `4px solid ${color}`, position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleEditClick(block)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                    <i className="fa-solid fa-pen-nib"></i>
                                </button>
                                <button onClick={() => { if (window.confirm('Eradicate environment stack?')) deleteMutation.mutate(block.id); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>

                            <h3 style={{ color: color, marginBottom: '1rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-code"></i> {getLocalizedText(block.title) || 'Unnamed Toolchain'}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
                                {getLocalizedText(block.description) || 'No core briefing assigned.'}
                            </p>

                            {block.terminal_command && (
                                <div className="terminal-output" style={{ background: '#09090b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #222', boxSizing: 'border-box' }}>
                                    {block.terminal_command}
                                </div>
                            )}
                        </div>
                    );
                })}

                {blocks?.length === 0 && !isCreating && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <i className="fa-solid fa-ghost" style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.5 }}></i>
                        <h3 style={{ margin: 0 }}>No environment components provisioned.</h3>
                        <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>Deploy a new stack to initialize terminal constraints.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
