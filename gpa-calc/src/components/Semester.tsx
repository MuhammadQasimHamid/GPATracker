'use client';

import { Semester as SemesterType } from '../types';
import { useGPA } from '../context/GPAContext';
import Course from './Course';
import { calculateGPA } from '../utils/calculations';

interface Props {
    semester: SemesterType;
}

export default function Semester({ semester }: Props) {
    const {
        addCourse, removeSemester, toggleSemester, renameSemester, moveSemesterUp, moveSemesterDown
    } = useGPA();
    const gpa = calculateGPA(semester.courses);

    return (
        <div className={`glass-card semester-card ${semester.isCollapsed ? 'collapsed' : ''}`}>
            <div className="semester-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1 }}>
                    <span
                        className={`chevron ${semester.isCollapsed ? '' : 'expanded'}`}
                        onClick={() => toggleSemester(semester.id)}
                        style={{ cursor: 'pointer', padding: '0.5rem' }}
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
                    <div className="reorder-btns">
                        <button className="reorder-btn" onClick={() => moveSemesterUp(semester.id)}>▲</button>
                        <button className="reorder-btn" onClick={() => moveSemesterDown(semester.id)}>▼</button>
                    </div>
                    <div className="gpa-badge">GPA: {gpa.toFixed(2)}</div>
                    <button
                        className="btn btn-danger btn-compact"
                        onClick={() => removeSemester(semester.id)}
                    >
                        Remove
                    </button>
                </div>
            </div>

            {!semester.isCollapsed && (
                <div className="semester-content">
                    <div className="grid-labels">
                        <span>Course Name</span>
                        <span>Grade</span>
                        <span>Credits (0-9)</span>
                        <span></span>
                    </div>
                    <div className="courses-list">
                        {semester.courses.map((course) => (
                            <Course key={course.id} semesterId={semester.id} course={course} />
                        ))}
                    </div>

                    <button className="btn btn-primary" onClick={() => addCourse(semester.id)} style={{ marginTop: '1rem' }}>
                        + Add Course
                    </button>
                </div>
            )}
        </div>
    );
}
