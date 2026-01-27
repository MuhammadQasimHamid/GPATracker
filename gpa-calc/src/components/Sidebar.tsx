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
                const semesterGPA = calculateGPA(semester.courses);

                // Calculate Impact for this specific semester
                const individualImpact = semester.courses
                    .filter(c => c.name && c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                    .map(c => ({
                        name: c.name,
                        loss: (4.0 - GRADE_POINTS[c.grade as Exclude<typeof c.grade, ''>]) * Number(c.creditHours)
                    }))
                    .filter(i => i.loss > 0)
                    .sort((a, b) => b.loss - a.loss);

                if (individualImpact.length === 0) return null;

                return (
                    <div key={semester.id} className="glass-card analytics-card">
                        <div className="sidebar-label">{semester.name} Impact</div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            GPA: {semesterGPA.toFixed(2)}
                        </p>
                        <div className="impact-list">
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
