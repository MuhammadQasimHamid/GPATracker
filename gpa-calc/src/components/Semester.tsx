'use client';

import { Semester as SemesterType } from '../types';
import { useGPA } from '../context/GPAContext';
import Course from './Course';
import { calculateGPA } from '../utils/calculations';
import { GRADE_POINTS } from '../types';

interface Props {
    semester: SemesterType;
}

export default function Semester({ semester }: Props) {
    const {
        addCourse, removeSemester, toggleSemester, renameSemester, moveSemesterUp, moveSemesterDown
    } = useGPA();
    const gpa = calculateGPA(semester.courses);

    // Calculate Semester Impact (Impact on CGPA)
    // Weighted sum of (4.0 - grade) * credits
    let semesterImpact = 0;
    semester.courses.forEach(c => {
        if (c.grade !== '' && c.creditHours !== '' && c.creditHours > 0) {
            semesterImpact += (4.0 - GRADE_POINTS[c.grade]) * c.creditHours;
        }
    });

    const individualImpact = semester.courses
        .filter(c => c.name && c.grade !== '' && c.creditHours !== '')
        .map(c => ({
            name: c.name,
            loss: (4.0 - GRADE_POINTS[c.grade as Exclude<typeof c.grade, ''>]) * Number(c.creditHours)
        }))
        .filter(i => i.loss > 0)
        .sort((a, b) => b.loss - a.loss);

    return (
        <div className={`glass-card semester-card ${semester.isCollapsed ? 'collapsed' : ''}`}>
            <div className="semester-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1 }}>
                    <div className="reorder-btns-left">
                        <button className="reorder-btn" onClick={() => moveSemesterUp(semester.id)}>▲</button>
                        <button className="reorder-btn" onClick={() => moveSemesterDown(semester.id)}>▼</button>
                    </div>
                    <span
                        className={`chevron ${semester.isCollapsed ? '' : 'expanded'}`}
                        onClick={() => toggleSemester(semester.id)}
                        style={{ cursor: 'pointer', padding: '0.2rem' }}
                    >
                        ▶
                    </span>
                    <input
                        type="text"
                        className="semester-title-input"
                        value={semester.name}
                        onChange={(e) => renameSemester(semester.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    {semesterImpact > 0 && (
                        <div className="impact-badge mini">Impact: -{semesterImpact.toFixed(2)}</div>
                    )}
                    <div className="gpa-badge">GPA: {gpa.toFixed(2)}</div>
                    <button
                        className="btn-danger-text"
                        onClick={() => removeSemester(semester.id)}
                    >
                        Remove
                    </button>
                </div>
            </div>

            {!semester.isCollapsed && (
                <div className="semester-content">
                    <div className="courses-list">
                        {semester.courses.map((course) => (
                            <Course key={course.id} semesterId={semester.id} course={course} />
                        ))}
                    </div>

                    <div className="semester-footer">
                        <button className="btn btn-primary btn-sm" onClick={() => addCourse(semester.id)}>
                            + Course
                        </button>

                        {individualImpact.length > 0 && (
                            <div className="semester-impact-analysis">
                                <div className="sidebar-label">Semester Impact Analysis</div>
                                <div className="impact-mini-grid">
                                    {individualImpact.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="impact-mini-item">
                                            <span className="impact-name-mini">{item.name}</span>
                                            <div className="impact-bar-bg-mini">
                                                <div className="impact-bar-fill-mini" style={{ width: `${Math.min(100, item.loss * 15)}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
