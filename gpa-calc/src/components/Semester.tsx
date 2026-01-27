'use client';

import { Semester as SemesterType } from '../types';
import { useGPA } from '../context/GPAContext';
import Course from './Course';
import { calculateGPA } from '../utils/calculations';

interface Props {
    semester: SemesterType;
}

export default function Semester({ semester }: Props) {
    const { addCourse, removeSemester } = useGPA();
    const gpa = calculateGPA(semester.courses);

    return (
        <div className="glass-card">
            <div className="semester-header">
                <h2 style={{ fontSize: '1.25rem' }}>{semester.name}</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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

            <div>
                {semester.courses.map((course) => (
                    <Course key={course.id} semesterId={semester.id} course={course} />
                ))}
            </div>

            <button className="btn btn-primary" onClick={() => addCourse(semester.id)} style={{ marginTop: '1rem' }}>
                + Add Course
            </button>
        </div>
    );
}
