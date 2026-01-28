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
                // Calculate Performance for individual courses (Contribution = Credits * GradePoints)
                const individualImpact = semester.courses
                    .filter(c => c.name && c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                    .map(c => ({
                        name: c.name,
                        contribution: GRADE_POINTS[c.grade as Exclude<typeof c.grade, ''>] * Number(c.creditHours),
                        max: 4.0 * Number(c.creditHours)
                    }))
                    .sort((a, b) => b.contribution - a.contribution);

                if (individualImpact.length === 0) return null;

                const semesterContribution = individualImpact.reduce((sum, item) => sum + item.contribution, 0);
                const semesterMax = individualImpact.reduce((sum, item) => sum + item.max, 0);

                return (
                    <div key={semester.id} className="glass-card analytics-card">
                        <div className="sidebar-label">{semester.name} PERFORMANCE</div>

                        <div className="semester-total-impact">
                            <div className="impact-bar-bg semester-main-bar">
                                <div
                                    className="impact-bar-fill"
                                    style={{
                                        width: `${(semesterContribution / semesterMax) * 100}%`,
                                        background: 'linear-gradient(90deg, #8b5cf6, #f472b6) !important'
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="impact-list" style={{ marginTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                                Subject contribution to GPA
                            </p>
                            {individualImpact.map((item, idx) => (
                                <div key={idx} className="impact-item">
                                    <div className="impact-info">
                                        <span className="impact-name">{item.name}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.contribution.toFixed(1)} pts</span>
                                    </div>
                                    <div className="impact-bar-bg">
                                        <div
                                            className="impact-bar-fill"
                                            style={{
                                                width: `${(item.contribution / item.max) * 100}%`,
                                                background: 'linear-gradient(90deg, #8b5cf6, #f472b6)'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <div className="sidebar-ads" style={{ marginTop: '2rem' }}>
                {/* Ads removed */}
            </div>
        </aside>
    );
}
