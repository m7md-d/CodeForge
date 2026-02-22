import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

interface Task {
    id: number;
    title: string;
    task_type: string;
    allowed_syscalls: string[];
    technical_requirements: string;
    example_main_code: string;
    raw_terminal_output: string;
}

interface TaskEditorProps {
    projectId: number;
    initialTask?: Task;
    onSuccessCallback?: () => void;
}

export default function TaskEditor({ projectId, initialTask, onSuccessCallback }: TaskEditorProps) {
    const queryClient = useQueryClient();
    const isEditing = !!initialTask;

    // --- State Management ---
    const [title, setTitle] = useState(initialTask?.title || '');
    const [taskType, setTaskType] = useState(initialTask?.task_type || 'mandatory');

    // Dynamic Array State
    const [allowedSyscalls, setAllowedSyscalls] = useState<string[]>(initialTask?.allowed_syscalls || []);
    const [newSyscall, setNewSyscall] = useState('');

    // Raw Monospace Text State
    const [techReqs, setTechReqs] = useState(initialTask?.technical_requirements || '');
    const [exampleCode, setExampleCode] = useState(initialTask?.example_main_code || '');
    const [rawOutput, setRawOutput] = useState(initialTask?.raw_terminal_output || '');

    // --- Dynamic Array Controllers ---
    const handleAddSyscall = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newSyscall.trim() !== '') {
            e.preventDefault();
            if (!allowedSyscalls.includes(newSyscall.trim())) {
                setAllowedSyscalls([...allowedSyscalls, newSyscall.trim()]);
            }
            setNewSyscall('');
        }
    };

    const handleRemoveSyscall = (syscallToRemove: string) => {
        setAllowedSyscalls(allowedSyscalls.filter(s => s !== syscallToRemove));
    };

    // --- TanStack Query Mutations ---
    const saveTaskMutation = useMutation({
        mutationFn: async (payload: any) => {
            if (isEditing) {
                return await api.put(`/tasks/${initialTask.id}`, payload);
            } else {
                return await api.post(`/projects/${projectId}/tasks`, payload);
            }
        },
        onSuccess: () => {
            // INSTANT FRICTIONLESS RE-RENDER
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            if (onSuccessCallback) onSuccessCallback();

            // Reset form if creating
            if (!isEditing) {
                setTitle('');
                setAllowedSyscalls([]);
                setTechReqs('');
                setExampleCode('');
                setRawOutput('');
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const payload = {
            title,
            task_type: taskType,
            allowed_syscalls: allowedSyscalls,
            technical_requirements: techReqs,
            example_main_code: exampleCode,
            raw_terminal_output: rawOutput
        };

        saveTaskMutation.mutate(payload);
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '4px', border: 'var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--neon-blue)', marginTop: 0, marginBottom: '1.5rem' }}>
                {isEditing ? `> EDIT_TASK: ${initialTask.id}` : '> INJECT_NEW_TASK'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Basic Fields */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: 'var(--neon-pink)', display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>$ task_title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. 0. Syscall Name"
                            style={{ width: '100%', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: 'var(--border-subtle)', padding: '0.75rem', fontFamily: 'var(--font-mono)' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ color: 'var(--neon-pink)', display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>$ task_type</label>
                        <select
                            value={taskType}
                            onChange={e => setTaskType(e.target.value)}
                            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: 'var(--border-subtle)', padding: '0.75rem', fontFamily: 'var(--font-mono)' }}
                        >
                            <option value="mandatory">mandatory</option>
                            <option value="advanced">advanced</option>
                        </select>
                    </div>
                </div>

                {/* Dynamic Array UI */}
                <div>
                    <label style={{ color: 'var(--neon-pink)', display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>$ allowed_syscalls (Array)</label>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input
                            type="text"
                            value={newSyscall}
                            onChange={e => setNewSyscall(e.target.value)}
                            onKeyDown={handleAddSyscall}
                            placeholder="Type syscall and press Enter..."
                            style={{ flex: 1, backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: 'var(--border-subtle)', padding: '0.5rem', fontFamily: 'var(--font-mono)' }}
                        />
                    </div>
                    <div>
                        {allowedSyscalls.map(syscall => (
                            <span key={syscall} className="array-badge">
                                {syscall}
                                <button type="button" onClick={() => handleRemoveSyscall(syscall)}>×</button>
                            </span>
                        ))}
                        {allowedSyscalls.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>[Empty array]</span>}
                    </div>
                </div>

                {/* Raw Monospace Ingestion textareas */}
                <div>
                    <label style={{ color: 'var(--neon-pink)', display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>$ technical_requirements (Raw Text)</label>
                    <textarea
                        className="terminal-input"
                        value={techReqs}
                        onChange={e => setTechReqs(e.target.value)}
                        placeholder="Enter precise technical constraints here..."
                    />
                </div>

                <div>
                    <label style={{ color: 'var(--neon-pink)', display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>$ example_main_code (Raw C Code)</label>
                    <textarea
                        className="terminal-input"
                        value={exampleCode}
                        onChange={e => setExampleCode(e.target.value)}
                        placeholder={`#include <stdio.h>\n\nint main(void) {\n    printf("Hello\\n");\n    return 0;\n}`}
                    />
                </div>

                <div>
                    <label style={{ color: 'var(--neon-pink)', display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>$ raw_terminal_output (Exact formatting required)</label>
                    <textarea
                        className="terminal-input"
                        value={rawOutput}
                        onChange={e => setRawOutput(e.target.value)}
                        placeholder={"==1234== HEAP SUMMARY:\n==1234==     in use at exit: 0 bytes in 0 blocks"}
                    />
                </div>

                <div style={{ marginTop: '1rem', borderTop: 'var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="primary" disabled={saveTaskMutation.isPending}>
                        {saveTaskMutation.isPending ? 'TRANSMITTING...' : 'COMMIT PAYLOAD'}
                    </button>
                </div>

                {saveTaskMutation.isError && (
                    <div style={{ color: 'var(--red-alert)', marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        [ERROR] Payload transmission failed. Verify backend integrity.
                    </div>
                )}

            </form>
        </div>
    );
}
