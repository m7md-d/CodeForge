import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

interface JSONInjectorProps {
    projectId: number;
    onSuccessCallback?: () => void;
}

export default function JSONInjector({ projectId, onSuccessCallback }: JSONInjectorProps) {
    const queryClient = useQueryClient();
    const [jsonPayload, setJsonPayload] = useState('');
    const [jsonError, setJsonError] = useState<string | null>(null);

    const bulkInjectMutation = useMutation({
        mutationFn: async (payload: any) => {
            // The backend expects the BulkTaskCreate schema: { "tasks": [ ... ] }
            return await api.post(`/projects/${projectId}/tasks/bulk`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId.toString()] });
            setJsonPayload('');
            setJsonError(null);
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (err: any) => {
            setJsonError(`API Error: ${err.response?.data?.detail?.[0]?.msg || err.message}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setJsonError(null);

        if (!jsonPayload.trim()) return;

        try {
            const parsed = JSON.parse(jsonPayload);

            // Ensure it wraps correctly into the { tasks: [...] } expected by BulkTaskCreate
            const finalPayload = Array.isArray(parsed) ? { tasks: parsed } : parsed;

            if (!finalPayload.tasks || !Array.isArray(finalPayload.tasks)) {
                throw new Error("Invalid schema: Payload must contain a 'tasks' array.");
            }

            bulkInjectMutation.mutate(finalPayload);
        } catch (err: any) {
            setJsonError(`JSON Parsing Error: ${err.message}`);
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '4px', border: 'var(--border-subtle)' }}>
            <h3 style={{ color: 'var(--neon-blue)', marginTop: 0, marginBottom: '1.5rem' }}>
                &gt; BULK_JSON_INGESTION_ENGINE
            </h3>

            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
                Paste the raw, LLM-generated JSON payload below. The engine requires strict adherence to the bilingual schema and skill tree map format.
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <textarea
                    value={jsonPayload}
                    onChange={(e) => setJsonPayload(e.target.value)}
                    placeholder={`{\n  "tasks": [\n    {\n      "title": {"en": "Task 0", "ar": "المهمة 0"},\n      "task_type": "mandatory",\n      "points": 50\n    }\n  ]\n}`}
                    style={{
                        width: '100%',
                        minHeight: '400px',
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--neon-green)',
                        border: jsonError ? '1px solid var(--red-alert)' : 'var(--border-subtle)',
                        padding: '1rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        resize: 'vertical',
                        whiteSpace: 'pre-wrap'
                    }}
                />

                {jsonError && (
                    <div style={{ color: 'var(--red-alert)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        [FATAL] {jsonError}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        className="primary"
                        disabled={bulkInjectMutation.isPending}
                        style={{ padding: '0.75rem 2rem', fontWeight: 'bold' }}
                    >
                        {bulkInjectMutation.isPending ? 'PARSING DATABLOCKS...' : 'INJECT JSON PAYLOAD'}
                    </button>
                </div>
            </form>
        </div>
    );
}
