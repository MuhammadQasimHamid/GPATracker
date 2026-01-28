'use client';
import { useState } from 'react';

import { useGPA } from '../context/GPAContext';
import { calculateCGPA, calculateGPA } from '../utils/calculations';
import { GRADE_POINTS } from '../types';

export default function Sidebar() {
    const { semesters } = useGPA();
    const cgpa = calculateCGPA(semesters);

    const [showPts, setShowPts] = useState(true);
    const [showGPA, setShowGPA] = useState(true);
    const [showCGPA, setShowCGPA] = useState(true);

    // Calculate Total Credits across ALL semesters for CGPA impact
    const totalAllCredits = semesters.reduce((outerSum, sem) => {
        return outerSum + sem.courses
            .filter(c => c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
            .reduce((innerSum, c) => innerSum + Number(c.creditHours), 0);
    }, 0);

    return (
        <aside className="sidebar">
            <div className="glass-card cgpa-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div className="sidebar-label">Cumulative GPA</div>
                    <div className="sidebar-label">
                        Total Credits: {totalAllCredits}
                    </div>
                </div>
                <div className="cgpa-value-small">{cgpa.toFixed(2)}</div>
            </div>

            <div className="glass-card filter-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div className="sidebar-label" style={{ marginBottom: '0.8rem' }}>Display Filters</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={showPts} onChange={() => setShowPts(!showPts)} /> Pts
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={showGPA} onChange={() => setShowGPA(!showGPA)} /> GPA
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={showCGPA} onChange={() => setShowCGPA(!showCGPA)} /> CGPA
                    </label>
                </div>
            </div>

            {semesters.map((semester) => {
                // Calculate Total Credits for this specific semester
                const semCredits = semester.courses
                    .filter(c => c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                    .reduce((sum, c) => sum + Number(c.creditHours), 0);

                // Calculate Impact for individual courses (Drop = Credits * (4.0 - GradePoints))
                const individualImpact = semester.courses
                    .filter(c => c.name && c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                    .map(c => ({
                        name: c.name,
                        loss: (4.0 - GRADE_POINTS[c.grade as Exclude<typeof c.grade, ''>]) * Number(c.creditHours),
                    }))
                    .filter(i => i.loss > 0)
                    .sort((a, b) => b.loss - a.loss);

                if (individualImpact.length === 0) return null;

                const totalSemLoss = individualImpact.reduce((sum, item) => sum + item.loss, 0);
                const semGPADrop = semCredits > 0 ? totalSemLoss / semCredits : 0;
                const semCGPADrop = totalAllCredits > 0 ? totalSemLoss / totalAllCredits : 0;

                return (
                    <div key={semester.id} className="glass-card analytics-card">
                        <div className="sidebar-label">{semester.name} IMPACT OF DROP</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.8rem', marginTop: '-0.3rem' }}>
                            {[
                                showPts && `-${totalSemLoss.toFixed(1)} pts`,
                                showGPA && `-${semGPADrop.toFixed(2)} GPA`,
                                showCGPA && `-${semCGPADrop.toFixed(2)} CGPA`
                            ].filter(Boolean).join(' / ')}
                        </div>

                        <div className="semester-total-impact">
                            <div className="impact-bar-bg semester-main-bar">
                                <div
                                    className="impact-bar-fill"
                                    style={{
                                        width: `${Math.min(100, totalSemLoss * 10)}%`,
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
                                const gpaDrop = semCredits > 0 ? item.loss / semCredits : 0;
                                const cgpaDrop = totalAllCredits > 0 ? item.loss / totalAllCredits : 0;
                                return (
                                    <div key={idx} className="impact-item">
                                        <div className="impact-info">
                                            <span className="impact-name">{item.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                {[
                                                    showPts && `-${item.loss.toFixed(1)} pts`,
                                                    showGPA && `-${gpaDrop.toFixed(2)} gpa`,
                                                    showCGPA && `-${cgpaDrop.toFixed(2)} cgpa`
                                                ].filter(Boolean).join(' / ')}
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
