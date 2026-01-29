'use client';
import { useState } from 'react';

import { useGPA } from '../context/GPAContext';
import { calculateCGPA, calculateGPA } from '../utils/calculations';
import { GRADE_POINTS } from '../types';
import GPAGraph from './GPAGraph';

export default function Sidebar() {
    const { semesters } = useGPA();
    const cgpa = calculateCGPA(semesters);

    const [showPts, setShowPts] = useState(true);
    const [showGPA, setShowGPA] = useState(true);
    const [showCGPA, setShowCGPA] = useState(true);
    const [impactMode, setImpactMode] = useState<'overall' | 'relative'>('overall');

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

            <GPAGraph semesters={semesters} />

            <div className="glass-card filter-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div className="sidebar-label" style={{ marginBottom: '0.8rem' }}>Display Filters</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
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
                <div className="sidebar-label" style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>Impact Mode</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setImpactMode('overall')}
                        style={{
                            flex: 1,
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.7rem',
                            borderRadius: '0.4rem',
                            border: impactMode === 'overall' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                            background: impactMode === 'overall' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                            color: impactMode === 'overall' ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Overall
                    </button>
                    <button
                        onClick={() => setImpactMode('relative')}
                        style={{
                            flex: 1,
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.7rem',
                            borderRadius: '0.4rem',
                            border: impactMode === 'relative' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                            background: impactMode === 'relative' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                            color: impactMode === 'relative' ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Relative
                    </button>
                </div>
            </div>


            {semesters.map((semester, semesterIndex) => {
                // Calculate Total Credits for this specific semester
                const semCredits = semester.courses
                    .filter(c => c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                    .reduce((sum, c) => sum + Number(c.creditHours), 0);

                // Calculate previous running CGPA for Relative mode
                let prevCGPA = 0;
                let prevCredits = 0;

                if (semesterIndex > 0) {
                    const previousSemesters = semesters.slice(0, semesterIndex);
                    let prevPoints = 0;

                    previousSemesters.forEach(sem => {
                        sem.courses.forEach(c => {
                            if (c.grade && c.creditHours && Number(c.creditHours) > 0) {
                                prevPoints += (GRADE_POINTS[c.grade as Exclude<typeof c.grade, ''>] * Number(c.creditHours));
                                prevCredits += Number(c.creditHours);
                            }
                        });
                    });

                    prevCGPA = prevCredits > 0 ? prevPoints / prevCredits : 0;
                }

                const semGPA = calculateGPA(semester.courses);
                const totalNewCredits = prevCredits + semCredits;

                let individualImpact: { name: string; impact: number; isGain: boolean }[] = [];
                let totalSemImpact = 0;
                let semGPAImpact = 0;
                let semCGPAImpact = 0;

                if (impactMode === 'overall') {
                    // Overall Mode: Calculate drop from 4.0 baseline
                    individualImpact = semester.courses
                        .filter(c => c.name && c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                        .map(c => {
                            const loss = (4.0 - GRADE_POINTS[c.grade as Exclude<typeof c.grade, ''>]) * Number(c.creditHours);
                            return {
                                name: c.name,
                                impact: Math.abs(loss),
                                isGain: false
                            };
                        })
                        .filter(i => i.impact > 0)
                        .sort((a, b) => b.impact - a.impact);

                    totalSemImpact = individualImpact.reduce((sum, item) => sum + item.impact, 0);
                    semGPAImpact = semCredits > 0 ? totalSemImpact / semCredits : 0;
                    semCGPAImpact = totalAllCredits > 0 ? totalSemImpact / totalAllCredits : 0;
                } else {
                    // Relative Mode: Calculate gain/drop from previous CGPA
                    if (semesterIndex === 0) {
                        // First semester: use 4.0 as baseline (perfect GPA)
                        individualImpact = semester.courses
                            .filter(c => c.name && c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                            .map(c => {
                                const gradePoints = GRADE_POINTS[c.grade as Exclude<typeof c.grade, ''>];
                                const courseImpact = ((gradePoints - 4.0) * Number(c.creditHours)) / semCredits;
                                return {
                                    name: c.name,
                                    impact: Math.abs(courseImpact),
                                    isGain: courseImpact > 0
                                };
                            })
                            .sort((a, b) => b.impact - a.impact);

                        totalSemImpact = semGPA - 4.0;
                        semGPAImpact = semGPA - 4.0;
                        semCGPAImpact = semGPA - 4.0;
                    } else {
                        // Subsequent semesters: calculate relative to previous CGPA
                        individualImpact = semester.courses
                            .filter(c => c.name && c.grade !== '' && c.creditHours !== '' && Number(c.creditHours) > 0)
                            .map(c => {
                                const gradePoints = GRADE_POINTS[c.grade as Exclude<typeof c.grade, ''>];
                                const courseImpact = ((gradePoints - prevCGPA) * Number(c.creditHours)) / totalNewCredits;
                                return {
                                    name: c.name,
                                    impact: Math.abs(courseImpact),
                                    isGain: courseImpact > 0
                                };
                            })
                            .sort((a, b) => b.impact - a.impact);

                        // Calculate overall semester impact
                        const newCGPA = (prevCGPA * prevCredits + semGPA * semCredits) / totalNewCredits;
                        totalSemImpact = newCGPA - prevCGPA;
                        semGPAImpact = semGPA - prevCGPA;
                        semCGPAImpact = totalSemImpact;
                    }
                }

                if (individualImpact.length === 0) return null;

                const isOverallGain = totalSemImpact > 0;
                const barColor = isOverallGain
                    ? 'linear-gradient(90deg, #10b981, #059669)'
                    : 'linear-gradient(90deg, #f472b6, #ef4444)';
                const labelPrefix = impactMode === 'overall' ? 'IMPACT OF DROP' : (isOverallGain ? 'GAIN FROM PREV' : 'DROP FROM PREV');

                return (
                    <div key={semester.id} className="glass-card analytics-card">
                        <div className="sidebar-label">{semester.name} {labelPrefix}</div>
                        <div style={{ fontSize: '0.7rem', color: isOverallGain && impactMode === 'relative' ? '#10b981' : 'var(--text-muted)', marginBottom: '0.8rem', marginTop: '-0.3rem' }}>
                            {[
                                showPts && `${isOverallGain && impactMode === 'relative' ? '+' : '-'}${Math.abs(totalSemImpact).toFixed(1)} pts`,
                                showGPA && `${isOverallGain && impactMode === 'relative' ? '+' : '-'}${Math.abs(semGPAImpact).toFixed(2)} GPA`,
                                showCGPA && `${isOverallGain && impactMode === 'relative' ? '+' : '-'}${Math.abs(semCGPAImpact).toFixed(2)} CGPA`
                            ].filter(Boolean).join(' / ')}
                        </div>

                        <div className="semester-total-impact">
                            <div className="impact-bar-bg semester-main-bar">
                                <div
                                    className="impact-bar-fill"
                                    style={{
                                        width: `${Math.min(100, Math.abs(totalSemImpact) * (impactMode === 'overall' ? 10 : 25))}%`,
                                        background: barColor
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="impact-list" style={{ marginTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                                {impactMode === 'overall' ? 'Subjects causing drop' : 'Subject contributions'}
                            </p>
                            {individualImpact.map((item, idx) => {
                                const itemBarColor = item.isGain
                                    ? 'linear-gradient(90deg, #10b981, #059669)'
                                    : 'linear-gradient(90deg, #f472b6, #ef4444)';

                                // Calculate display values based on mode
                                let displayPts, displayGPA, displayCGPA;

                                if (impactMode === 'overall') {
                                    // Overall mode: item.impact is already in points
                                    displayPts = item.impact;
                                    displayGPA = semCredits > 0 ? item.impact / semCredits : 0;
                                    displayCGPA = totalAllCredits > 0 ? item.impact / totalAllCredits : 0;
                                } else {
                                    // Relative mode: item.impact is CGPA impact, need to back-calculate
                                    displayCGPA = item.impact;
                                    displayPts = item.impact * totalNewCredits;
                                    displayGPA = item.impact * (totalNewCredits / semCredits);
                                }

                                return (
                                    <div key={idx} className="impact-item">
                                        <div className="impact-info">
                                            <span className="impact-name">{item.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: item.isGain ? '#10b981' : 'var(--text-muted)' }}>
                                                {[
                                                    showPts && `${item.isGain && impactMode === 'relative' ? '+' : '-'}${displayPts.toFixed(1)} pts`,
                                                    showGPA && `${item.isGain && impactMode === 'relative' ? '+' : '-'}${displayGPA.toFixed(2)} gpa`,
                                                    showCGPA && `${item.isGain && impactMode === 'relative' ? '+' : '-'}${displayCGPA.toFixed(2)} cgpa`
                                                ].filter(Boolean).join(' / ')}
                                            </span>
                                        </div>
                                        <div className="impact-bar-bg">
                                            <div
                                                className="impact-bar-fill"
                                                style={{
                                                    width: `${Math.min(100, item.impact * (impactMode === 'overall' ? 15 : 40))}%`,
                                                    background: itemBarColor
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
