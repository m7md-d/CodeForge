import { useState } from 'react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function OmniEditModal({ endpoint, item, onClose }: { endpoint: string, item: any, onClose: () => void }) {
    const queryClient = useQueryClient();

    // Strip ID and foreign keys for raw data payload
    const { id, sprint_id, project_id, tasks, projects, ...editableData } = item;

    const [formData, setFormData] = useState<any>(JSON.parse(JSON.stringify(editableData)));

    const mutation = useMutation({
        mutationFn: async () => {
            return await api.put(`/${endpoint}/${item.id}`, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sprints'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            onClose();
        },
        onError: (err: any) => alert("Schema Override Failed: " + err.message)
    });

    const handleArrayChange = (field: string, val: string) => {
        const arr = val.split(',').map(s => s.trim()).filter(s => s);
        setFormData({ ...formData, [field]: arr });
    };

    const [newSkillKey, setNewSkillKey] = useState('');
    const [newSkillVal, setNewSkillVal] = useState(0);

    const addSkill = (field: string) => {
        if (!newSkillKey) return;
        setFormData({
            ...formData,
            [field]: { ...(formData[field] || {}), [newSkillKey]: newSkillVal }
        });
        setNewSkillKey('');
        setNewSkillVal(0);
    };

    const removeSkill = (field: string, keyToRemove: string) => {
        const current = { ...formData[field] };
        delete current[keyToRemove];
        setFormData({ ...formData, [field]: current });
    };

    const inputStyle = { width: '100%', padding: '0.75rem', color: 'white', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', outline: 'none' };
    const labelStyle = { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' };

    const renderSprintForm = () => (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={labelStyle}>Title (EN)</label>
                    <input style={inputStyle} value={formData.title?.en || ''} onChange={e => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })} />
                </div>
                <div>
                    <label style={labelStyle}>Title (AR)</label>
                    <input style={inputStyle} value={formData.title?.ar || ''} onChange={e => setFormData({ ...formData, title: { ...formData.title, ar: e.target.value } })} dir="rtl" />
                </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Skill Weights</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                    <input placeholder="e.g. Algorithms" style={{ ...inputStyle, flex: 1 }} value={newSkillKey} onChange={e => setNewSkillKey(e.target.value)} />
                    <input type="number" style={{ ...inputStyle, width: '100px' }} value={newSkillVal} onChange={e => setNewSkillVal(Number(e.target.value))} />
                    <button type="button" onClick={() => addSkill('skill_weights')} style={{ padding: '0 1.5rem', background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}><i className="fa-solid fa-plus"></i></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {formData.skill_weights && Object.entries(formData.skill_weights).map(([k, v]) => (
                        <span key={k} className="array-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(157, 78, 221, 0.1)', borderColor: 'var(--primary)', color: 'white' }}>
                            {k}: {v as number}
                            <i className="fa-solid fa-times" style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={() => removeSkill('skill_weights', k)}></i>
                        </span>
                    ))}
                </div>
            </div>
        </>
    );

    const renderProjectForm = () => (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={labelStyle}>Title (EN)</label>
                    <input style={inputStyle} value={formData.title?.en || ''} onChange={e => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })} />
                </div>
                <div>
                    <label style={labelStyle}>Title (AR)</label>
                    <input style={inputStyle} value={formData.title?.ar || ''} onChange={e => setFormData({ ...formData, title: { ...formData.title, ar: e.target.value } })} dir="rtl" />
                </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Directory Name</label>
                <input style={{ ...inputStyle, fontFamily: 'monospace' }} value={formData.directory_name || ''} onChange={e => setFormData({ ...formData, directory_name: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Deadline (ISO String)</label>
                <input type="datetime-local" style={inputStyle} value={formData.deadline ? formData.deadline.substring(0, 16) : ''} onChange={e => setFormData({ ...formData, deadline: new Date(e.target.value).toISOString() })} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Global Constraints (Comma Separated)</label>
                <input style={inputStyle} value={(formData.global_constraints || []).join(', ')} onChange={e => handleArrayChange('global_constraints', e.target.value)} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Forbidden Functions (Comma Separated)</label>
                <input style={inputStyle} value={(formData.forbidden_functions || []).join(', ')} onChange={e => handleArrayChange('forbidden_functions', e.target.value)} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Project Skill Tags (Mappings)</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                    <input placeholder="e.g. C Language" style={{ ...inputStyle, flex: 1 }} value={newSkillKey} onChange={e => setNewSkillKey(e.target.value)} />
                    <input type="number" step="0.1" style={{ ...inputStyle, width: '100px' }} value={newSkillVal} onChange={e => setNewSkillVal(Number(e.target.value))} />
                    <button type="button" onClick={() => addSkill('skill_tags')} style={{ padding: '0 1.5rem', background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}><i className="fa-solid fa-plus"></i></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {formData.skill_tags && Object.entries(formData.skill_tags).map(([k, v]) => (
                        <span key={k} className="array-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(157, 78, 221, 0.1)', borderColor: 'var(--primary)', color: 'white' }}>
                            {k}: {v as number}
                            <i className="fa-solid fa-times" style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={() => removeSkill('skill_tags', k)}></i>
                        </span>
                    ))}
                </div>
            </div>
        </>
    );

    const renderTaskForm = () => (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={labelStyle}>Title (EN)</label>
                    <input style={inputStyle} value={formData.title?.en || ''} onChange={e => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })} />
                </div>
                <div>
                    <label style={labelStyle}>Title (AR)</label>
                    <input style={inputStyle} value={formData.title?.ar || ''} onChange={e => setFormData({ ...formData, title: { ...formData.title, ar: e.target.value } })} dir="rtl" />
                </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Task Type</label>
                <select style={{ ...inputStyle, background: '#111' }} value={formData.task_type || 'mandatory'} onChange={e => setFormData({ ...formData, task_type: e.target.value })}>
                    <option value="mandatory">Mandatory</option>
                    <option value="advanced">Advanced</option>
                </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Allowed Syscalls (Comma Separated)</label>
                <input style={inputStyle} value={(formData.allowed_syscalls || []).join(', ')} onChange={e => handleArrayChange('allowed_syscalls', e.target.value)} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Base Task Points (Integer)</label>
                <input type="number" style={{ ...inputStyle, background: '#111' }} value={formData.points || 0} onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={labelStyle}>Technical Requirements (EN)</label>
                    <textarea style={{ ...inputStyle, height: '120px', resize: 'vertical' }} value={formData.technical_requirements?.en || ''} onChange={e => setFormData({ ...formData, technical_requirements: { ...formData.technical_requirements, en: e.target.value } })} />
                </div>
                <div>
                    <label style={labelStyle}>Technical Requirements (AR)</label>
                    <textarea style={{ ...inputStyle, height: '120px', resize: 'vertical' }} value={formData.technical_requirements?.ar || ''} onChange={e => setFormData({ ...formData, technical_requirements: { ...formData.technical_requirements, ar: e.target.value } })} dir="rtl" />
                </div>
            </div>
        </>
    );

    return (
        <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
            <div className="modal-content glass animate-fade" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative', borderTop: '4px solid var(--primary)' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.75rem' }}>
                    <span><i className="fa-solid fa-pen-nib"></i> Omni-Edit: {endpoint.toUpperCase()}</span>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}><i className="fa-solid fa-xmark"></i></button>
                </h2>

                <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
                    {endpoint === 'sprints' && renderSprintForm()}
                    {endpoint === 'projects' && renderProjectForm()}
                    {endpoint === 'tasks' && renderTaskForm()}

                    <div style={{ marginTop: '2.5rem' }}>
                        <button type="submit" disabled={mutation.isPending} style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '2px', fontSize: '1.1rem', transition: 'all 0.3s' }}>
                            {mutation.isPending ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-upload"></i> TRANSMIT MUTATION</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
