'use client';
import { useMemo } from 'react';
import { Semester } from '../types';
import { calculateGPA } from '../utils/calculations';
import { GRADE_POINTS } from '../types';

interface Props {
    semesters: Semester[];
}

export default function GPAGraph({ semesters }: Props) {
    const graphData = useMemo(() => {
        // First map to calculate everything...
        const allData = semesters.map((semester, index) => {
            const semesterGPA = calculateGPA(semester.courses);

            // Check if this semester has any valid courses that contribute
            const hasData = semester.courses.some(c => c.grade && c.creditHours && Number(c.creditHours) > 0);

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
                hasData, // Flag to filter later
                gpa: semesterGPA,
                cgpa: runningCGPA
            };
        });

        // ...then filter and re-index count
        return allData
            .filter(d => d.hasData)
            .map((d, i) => ({
                ...d,
                count: i + 1
            }));
    }, [semesters]);

    if (graphData.length === 0) return null;

    const maxGPA = 4.0;

    // Adjusted dimensions to remove empty space and increase visibility
    const viewWidth = 800;
    const viewHeight = 310; // Increased height to accommodate the "You Are Here" indicator
    const padding = { top: 90, right: 80, bottom: 30, left: 60 }; // Increased top padding significantly

    // Calculate chart dimensions
    const chartHeight = viewHeight - padding.top - padding.bottom;
    const chartWidth = viewWidth - padding.left - padding.right;

    const getYPosition = (gpa: number) => {
        return padding.top + chartHeight - (gpa / maxGPA) * chartHeight;
    };

    const getXPosition = (index: number, total: number) => {
        if (total <= 1) return padding.left;
        const segmentWidth = chartWidth / (total - 1);
        return padding.left + index * segmentWidth;
    };

    // Generate path for curved CGPA line
    const cgpaPath = graphData.map((d, i) => {
        const x = getXPosition(i, graphData.length);
        const y = getYPosition(d.cgpa);

        if (i === 0) {
            return `M ${x} ${y}`;
        }

        const prevX = getXPosition(i - 1, graphData.length);
        const prevY = getYPosition(graphData[i - 1].cgpa);
        const cpX = (prevX + x) / 2;

        return `Q ${cpX} ${prevY}, ${x} ${y}`;
    }).join(' ');

    // Generate path for straight GPA line
    const gpaPath = graphData.map((d, i) => {
        const x = getXPosition(i, graphData.length);
        const y = getYPosition(d.gpa);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    return (
        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', overflow: 'visible' }}>
            <div className="sidebar-label" style={{ marginBottom: '0.5rem', position: 'relative', zIndex: 5 }}>GPA Trend</div>

            <div style={{ width: '100%', paddingBottom: '1rem', position: 'relative', zIndex: 10 }}>
                <svg
                    viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                >
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map(gpa => (
                        <g key={gpa}>
                            <line
                                x1={padding.left}
                                y1={getYPosition(gpa)}
                                x2={viewWidth - padding.right}
                                y2={getYPosition(gpa)}
                                stroke="rgba(255, 255, 255, 0.08)"
                                strokeWidth="2"
                            />
                        </g>
                    ))}

                    {/* Y-Axis Line */}
                    <line
                        x1={padding.left}
                        y1={padding.top}
                        x2={padding.left}
                        y2={viewHeight - padding.bottom}
                        stroke="rgba(255, 255, 255, 0.15)"
                        strokeWidth="2"
                    />

                    {/* GPA straight dotted line (gray) */}
                    <path
                        d={gpaPath}
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="3" // Thicker line
                        strokeDasharray="8,8"
                        strokeLinecap="round"
                    />

                    {/* CGPA curved line (yellow) */}
                    <path
                        d={cgpaPath}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="5" // Thicker line
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data points and Value Labels */}
                    {graphData.map((d, i) => {
                        const x = getXPosition(i, graphData.length);
                        const cgpaY = getYPosition(d.cgpa);
                        const gpaY = getYPosition(d.gpa);
                        const isLast = i === graphData.length - 1;

                        // Collision detection for labels
                        // If values are close, push them apart
                        const diff = Math.abs(cgpaY - gpaY);
                        const isClose = diff < 30;
                        const cgpaLayoutY = isClose ? (cgpaY < gpaY ? cgpaY - 15 : cgpaY + 25) : cgpaY - 10;
                        const gpaLayoutY = isClose ? (gpaY < cgpaY ? gpaY - 15 : gpaY + 25) : gpaY - 10;

                        return (
                            <g key={i}>
                                {/* GPA point */}
                                <circle
                                    cx={x}
                                    cy={gpaY}
                                    r="5"
                                    fill="#374151"
                                    stroke="#9ca3af"
                                    strokeWidth="3"
                                />
                                {/* GPA Value Label */}
                                <text
                                    x={x + 15}
                                    y={gpaLayoutY}
                                    textAnchor="start"
                                    dominantBaseline="middle"
                                    fill="#d1d5db"
                                    fontSize="20" // Larger font
                                    fontWeight="700"
                                >
                                    {d.gpa.toFixed(2)}
                                </text>

                                {/* CGPA point */}
                                <circle
                                    cx={x}
                                    cy={cgpaY}
                                    r="6"
                                    fill="#fbbf24"
                                />
                                {/* CGPA Value Label */}
                                <text
                                    x={x + 15}
                                    y={cgpaLayoutY}
                                    textAnchor="start"
                                    dominantBaseline="middle"
                                    fill="#fbbf24"
                                    fontSize="24" // Larger font
                                    fontWeight="800"
                                >
                                    {d.cgpa.toFixed(2)}
                                </text>

                                {/* Bouncing Arrow for the LAST CGPA point */}
                                {isLast && (
                                    <g transform={`translate(${x}, ${cgpaY - 50})`}>
                                        <style>
                                            {`
                                                @keyframes bounce-arrow {
                                                    0%, 100% { transform: translateY(0); opacity: 1; }
                                                    50% { transform: translateY(-8px); opacity: 0.8; }
                                                }
                                                @keyframes twinkle-text {
                                                    0%, 100% { opacity: 1; text-shadow: 0 0 5px rgba(251, 191, 36, 0.5); }
                                                    50% { opacity: 0.8; text-shadow: 0 0 15px rgba(251, 191, 36, 0.8); }
                                                }
                                            `}
                                        </style>
                                        <g style={{ animation: 'bounce-arrow 1.5s infinite ease-in-out' }}>
                                            {/* Thicker, bolder arrow */}
                                            <path
                                                d="M -10 -16 L 0 0 L 10 -16 L 0 -6 Z"
                                                fill="#fbbf24"
                                                stroke="#78350f"
                                                strokeWidth="1.5"
                                            />
                                            {/* Text background for readability */}
                                            <rect x="-60" y="-42" width="120" height="24" rx="6" fill="rgba(0,0,0,0.7)" />
                                            <text
                                                x="0"
                                                y="-26"
                                                textAnchor="middle"
                                                fill="#fbbf24"
                                                fontSize="14"
                                                fontWeight="900"
                                                style={{ animation: 'twinkle-text 2s infinite ease-in-out', letterSpacing: '1px' , zIndex: 100 }}
                                            >
                                                You Are Here
                                            </text>
                                        </g>
                                    </g>
                                )}
                            </g>
                        );
                    })}

                    {/* X-axis labels (Simple Numbers: 1, 2, 3...) */}
                    {graphData.map((d, i) => {
                        const x = getXPosition(i, graphData.length);
                        const y = viewHeight - padding.bottom + 20;

                        return (
                            <text
                                key={i}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                fill="#e5e7eb" // Brighter white
                                fontSize="20" // Larger font
                                fontWeight="700"
                            >
                                {d.count}
                            </text>
                        );
                    })}

                    {/* Y-Axis Labels */}
                    {([0, 1, 2, 3, 4] as number[]).map(gpa => {
                        const y = getYPosition(gpa);
                        return (
                            <text
                                key={gpa}
                                x={padding.left - 15}
                                y={y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fill="#9ca3af" // Brighter gray
                                fontSize="16" // Larger font
                                fontWeight="600"
                            >
                                {gpa.toFixed(1)}
                            </text>
                        );
                    })}

                </svg>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '24px', height: '3px', background: '#9ca3af', borderTop: '3px dotted #9ca3af' }}></div>
                    <span style={{ color: '#d1d5db', fontWeight: 500 }}>Sem GPA</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '24px', height: '3px', background: '#fbbf24' }}></div>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>Running CGPA</span>
                </div>
            </div>
        </div>
    );
}
