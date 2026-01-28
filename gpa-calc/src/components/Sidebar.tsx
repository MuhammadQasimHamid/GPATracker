'use client';

import { useGPA } from '../context/GPAContext';
import { calculateCGPA, calculateGPA } from '../utils/calculations';
import { GRADE_POINTS } from '../types';

export default function Sidebar() {
    const { semesters } = useGPA();
    const cgpa = calculateCGPA(semesters);

    return (
        <aside className="sidebar">
            <div className="glass-card cgpa-card">
                <div className="sidebar-label">Cumulative GPA</div>
                <div className="cgpa-value-small">{cgpa.toFixed(2)}</div>
            </div>

            {semesters.map((semester) => {
                // Calculate Impact for individual courses
                const individualImpact = semester.courses
                    .filter(c => c.name && c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                    .map(c => ({
                        name: c.name,
                        loss: (4.0 - GRADE_POINTS[c.grade as Exclude<typeof c.grade, ''>]) * Number(c.creditHours)
                    }))
                    .filter(i => i.loss > 0)
                    .sort((a, b) => b.loss - a.loss);

                // Calculate Total Semester Impact
                const totalSemesterLoss = individualImpact.reduce((sum, item) => sum + item.loss, 0);

                if (individualImpact.length === 0) return null;

                return (
                    <div key={semester.id} className="glass-card analytics-card">
                        <div className="sidebar-label">{semester.name} TOTAL IMPACT</div>

                        {/* Main Semester Impact Bar */}
                        <div className="semester-total-impact">
                            <div className="impact-bar-bg semester-main-bar">
                                <div
                                    className="impact-bar-fill"
                                    style={{ width: `${Math.min(100, totalSemesterLoss * 10)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="impact-list" style={{ marginTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                                Subjects reducing your GPA
                            </p>
                            {individualImpact.map((item, idx) => (
                                <div key={idx} className="impact-item">
                                    <div className="impact-info">
                                        <span className="impact-name">{item.name}</span>
                                    </div>
                                    <div className="impact-bar-bg">
                                        <div
                                            className="impact-bar-fill"
                                            style={{ width: `${Math.min(100, item.loss * 15)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <div className="ad-placeholder-sidebar">
                {/* Ad Space */}
            </div>
        </aside>
    );
}
