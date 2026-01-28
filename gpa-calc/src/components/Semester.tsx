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
                    <div className="courses-list" >
                        <div className="course-header desktop-only">
                            <div className="header-label">Course Name</div>
                            <div className="header-label">Grade</div>
                            <div className="header-label">CH</div>
                            <div className="header-label"></div>
                        </div>
                        {semester.courses.map((course) => (
                            <Course key={course.id} semesterId={semester.id} course={course} />
                        ))}
                    </div>

                    <div className="semester-footer">
                        <button className="btn btn-primary btn-sm" onClick={() => addCourse(semester.id)}>
                            + Course
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
