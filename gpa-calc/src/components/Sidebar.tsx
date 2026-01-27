'use client';

import { useGPA } from '../context/GPAContext';
import { calculateCGPA } from '../utils/calculations';
import { GRADE_POINTS, Course } from '../types';

export default function Sidebar() {
    const { semesters } = useGPA();
    const cgpa = calculateCGPA(semesters);

    // Calculate GPA Impact
    // For each complete course, calculate potential "loss" relative to 4.0
    const allCourses: { name: string; loss: number; semesterName: string }[] = [];
    semesters.forEach(s => {
        s.courses.forEach(c => {
            if (c.name && c.grade !== '' && c.creditHours !== '' && c.creditHours > 0) {
                const points = GRADE_POINTS[c.grade];
                const loss = (4.0 - points) * c.creditHours;
                if (loss > 0) {
                    allCourses.push({ name: c.name, loss, semesterName: s.name });
                }
            }
        });
    });

    // Sort by loss descending and take top 5
    const topImpact = allCourses.sort((a, b) => b.loss - a.loss).slice(0, 5);

    return (
        <aside className="sidebar">
            <div className="glass-card cgpa-card">
                <div className="sidebar-label">Cumulative GPA</div>
                <div className="cgpa-value-small">{cgpa.toFixed(2)}</div>
            </div>

            <div className="glass-card analytics-card">
                <div className="sidebar-label">GPA Impact Analysis</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Subjects bringing your GPA down most:
                </p>
                <div className="impact-list">
                    {topImpact.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            All subjects are at 4.0! 🚀
                        </p>
                    ) : (
                        topImpact.map((item, idx) => (
                            <div key={idx} className="impact-item">
                                <div className="impact-info">
                                    <span className="impact-name">{item.name}</span>
                                    <span className="impact-sem">{item.semesterName}</span>
                                </div>
                                <div className="impact-bar-bg">
                                    <div
                                        className="impact-bar-fill"
                                        style={{ width: `${Math.min(100, item.loss * 15)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="ad-placeholder-sidebar">
                {/* Analytics Ad Space */}
            </div>
        </aside>
    );
}
