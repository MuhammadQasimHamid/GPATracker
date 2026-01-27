'use client';

import { Course as CourseType, Grade } from '../types';
import { useGPA } from '../context/GPAContext';

interface Props {
    semesterId: string;
    course: CourseType;
}

const grades: Grade[] = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

export default function Course({ semesterId, course }: Props) {
    const { updateCourse, removeCourse } = useGPA();

    return (
        <div className="grid-cols">
            <input
                type="text"
                placeholder="Course Name"
                value={course.name}
                onChange={(e) => updateCourse(semesterId, course.id, { name: e.target.value })}
            />
            <input
                type="number"
                placeholder="Credits"
                min="0"
                value={course.creditHours}
                onChange={(e) => updateCourse(semesterId, course.id, { creditHours: Number(e.target.value) })}
            />
            <select
                value={course.grade}
                onChange={(e) => updateCourse(semesterId, course.id, { grade: e.target.value as Grade })}
            >
                {grades.map((g) => (
                    <option key={g} value={g}>
                        {g}
                    </option>
                ))}
            </select>
            <button
                className="btn btn-danger"
                onClick={() => removeCourse(semesterId, course.id)}
                aria-label="Remove Course"
            >
                ✕
            </button>
        </div>
    );
}
