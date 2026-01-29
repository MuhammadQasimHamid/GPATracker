'use client';
import { useMemo } from 'react';
import { Semester } from '../types';
import { calculateGPA, calculateCGPA } from '../utils/calculations';
import { GRADE_POINTS } from '../types';

interface Props {
    semesters: Semester[];
}

export default function GPAGraph({ semesters }: Props) {
    const graphData = useMemo(() => {
        return semesters.map((semester, index) => {
            const semesterGPA = calculateGPA(semester.courses);

            // Calculate running CGPA up to this semester
            const previousSemesters = semesters.slice(0, index + 1);
            let cumPoints = 0;
            let cumCredits = 0;

            previousSemesters.forEach(sem => {
                sem.courses.forEach(c => {
                    if (c.grade && c.creditHours && Number(c.creditHours) > 0) {
                        cumPoints += (GRADE_POINTS[c.grade] * Number(c.creditHours));
                        cumCredits += Number(c.creditHours);
                    }
                });
            });

            const runningCGPA = cumCredits === 0 ? 0 : cumPoints / cumCredits;

            return {
                name: semester.name,
                gpa: semesterGPA,
                cgpa: runningCGPA
            };
        });
    }, [semesters]);

    if (graphData.length === 0) return null;

    const maxGPA = 4.0;
    const graphHeight = 200;
    const graphWidth = 100; // percentage
    const padding = { top: 10, right: 10, bottom: 30, left: 40 };

    // Calculate positions
    const chartHeight = graphHeight - padding.top - padding.bottom;
    const chartWidth = graphWidth - padding.left - padding.right;

    const getYPosition = (gpa: number) => {
        return padding.top + chartHeight - (gpa / maxGPA) * chartHeight;
    };

    const getXPosition = (index: number) => {
        const segmentWidth = chartWidth / (graphData.length - 1 || 1);
        return padding.left + index * segmentWidth;
    };

    // Generate path for curved CGPA line
    const cgpaPath = graphData.map((d, i) => {
        const x = getXPosition(i);
        const y = getYPosition(d.cgpa);

        if (i === 0) {
            return `M ${x} ${y}`;
        }

        // Create smooth curve
        const prevX = getXPosition(i - 1);
        const prevY = getYPosition(graphData[i - 1].cgpa);
        const cpX = (prevX + x) / 2;

        return `Q ${cpX} ${prevY}, ${x} ${y}`;
    }).join(' ');

    // Generate path for straight GPA line
    const gpaPath = graphData.map((d, i) => {
        const x = getXPosition(i);
        const y = getYPosition(d.gpa);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    return (
        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
            <div className="sidebar-label" style={{ marginBottom: '1rem' }}>GPA Trend</div>

            <svg
                width="100%"
                height={graphHeight}
                viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                preserveAspectRatio="none"
                style={{ overflow: 'visible' }}
            >
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(gpa => (
                    <g key={gpa}>
                        <line
                            x1={padding.left}
                            y1={getYPosition(gpa)}
                            x2={graphWidth - padding.right}
                            y2={getYPosition(gpa)}
                            stroke="rgba(255, 255, 255, 0.05)"
                            strokeWidth="0.5"
                        />
                        <text
                            x={padding.left - 5}
                            y={getYPosition(gpa)}
                            fill="var(--text-muted)"
                            fontSize="8"
                            textAnchor="end"
                            dominantBaseline="middle"
                        >
                            {gpa.toFixed(1)}
                        </text>
                    </g>
                ))}

                {/* CGPA curved line (red) */}
                <path
                    d={cgpaPath}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* GPA straight dotted line (gray) */}
                <path
                    d={gpaPath}
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                    strokeLinecap="round"
                />

                {/* Data points */}
                {graphData.map((d, i) => {
                    const x = getXPosition(i);
                    const cgpaY = getYPosition(d.cgpa);
                    const gpaY = getYPosition(d.gpa);

                    return (
                        <g key={i}>
                            {/* CGPA point */}
                            <circle
                                cx={x}
                                cy={cgpaY}
                                r="2"
                                fill="#ef4444"
                            />
                            {/* GPA point */}
                            <circle
                                cx={x}
                                cy={gpaY}
                                r="2"
                                fill="#6b7280"
                            />
                        </g>
                    );
                })}

                {/* X-axis labels */}
                {graphData.map((d, i) => {
                    const x = getXPosition(i);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={graphHeight - 10}
                            fill="var(--text-muted)"
                            fontSize="7"
                            textAnchor="middle"
                        >
                            {d.name.substring(0, 8)}
                        </text>
                    );
                })}
            </svg>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <div style={{ width: '12px', height: '2px', background: '#6b7280', borderTop: '1.5px dashed #6b7280' }}></div>
                    <span style={{ color: 'var(--text-muted)' }}>Semester GPA</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <div style={{ width: '12px', height: '2px', background: '#ef4444' }}></div>
                    <span style={{ color: 'var(--text-muted)' }}>Running CGPA</span>
                </div>
            </div>
        </div>
    );
}
