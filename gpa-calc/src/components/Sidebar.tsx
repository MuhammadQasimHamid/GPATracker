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
                // Calculate Total Credits for this semester
                const totalCredits = semester.courses
                    .filter(c => c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                    .reduce((sum, c) => sum + Number(c.creditHours), 0);

                // Calculate Impact for individual courses (Drop = Credits * (4.0 - GradePoints))
                const individualImpact = semester.courses
                    .filter(c => c.name && c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                    .map(c => ({
                        name: c.name,
                        loss: (4.0 - GRADE_POINTS[c.grade as Exclude<typeof c.grade, ''>]) * Number(c.creditHours)
                    }))
                    .filter(i => i.loss > 0)
                    .sort((a, b) => b.loss - a.loss);

                if (individualImpact.length === 0) return null;

                const totalSemesterLoss = individualImpact.reduce((sum, item) => sum + item.loss, 0);

                return (
                    <div key={semester.id} className="glass-card analytics-card">
                        <div className="sidebar-label">{semester.name} IMPACT OF DROP</div>

                        <div className="semester-total-impact">
                            <div className="impact-bar-bg semester-main-bar">
                                <div
                                    className="impact-bar-fill"
                                    style={{
                                        width: `${Math.min(100, totalSemesterLoss * 10)}%`,
                                        background: 'linear-gradient(90deg, #f472b6, #ef4444) !important'
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="impact-list" style={{ marginTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                                Subjects causing drop
                            </p>
                            {individualImpact.map((item, idx) => {
                                const gpaDrop = totalCredits > 0 ? item.loss / totalCredits : 0;
                                return (
                                    <div key={idx} className="impact-item">
                                        <div className="impact-info">
                                            <span className="impact-name">{item.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                -{item.loss.toFixed(1)} pts / -{gpaDrop.toFixed(2)} gpa / - {cgpaDrop.toFixed(2)} cgpa
                                            </span>
                                        </div>
                                        <div className="impact-bar-bg">
                                            <div
                                                className="impact-bar-fill"
                                                style={{
                                                    width: `${Math.min(100, item.loss * 15)}%`,
                                                    background: 'linear-gradient(90deg, #f472b6, #ef4444)'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
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
