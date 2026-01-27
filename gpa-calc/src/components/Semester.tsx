'use client';

import { Semester as SemesterType } from '../types';
import { useGPA } from '../context/GPAContext';
import Course from './Course';
import { calculateGPA } from '../utils/calculations';

interface Props {
    semester: SemesterType;
}

export default function Semester({ semester }: Props) {
    const { addCourse, removeSemester, toggleSemester } = useGPA();
    const gpa = calculateGPA(semester.courses);

    return (
        <div className={`glass-card semester-card ${semester.isCollapsed ? 'collapsed' : ''}`}>
            <div className="semester-header" onClick={() => toggleSemester(semester.id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span className={`chevron ${semester.isCollapsed ? '' : 'expanded'}`}>▶</span>
                    <h2 style={{ fontSize: '1.25rem' }}>{semester.name}</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <div className="gpa-badge">GPA: {gpa.toFixed(2)}</div>
                    <button
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.6rem' }}
                        onClick={() => removeSemester(semester.id)}
                    >
                        Remove
                    </button>
                </div>
            </div>

            {!semester.isCollapsed && (
                <div className="semester-content">
                    <div className="grid-labels">
                        <span>Name</span>
                        <span>Grade</span>
                        <span>Credits</span>
                        <span></span>
                    </div>
                    <div>
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
