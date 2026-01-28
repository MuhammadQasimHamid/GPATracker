'use client';

import { Course as CourseType, Grade } from '../types';
import { useGPA } from '../context/GPAContext';

interface Props {
    semesterId: string;
    course: CourseType;
}

const grades: Grade[] = ['', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

export default function Course({ semesterId, course }: Props) {
    const { updateCourse, removeCourse } = useGPA();

    const isNameEmpty = course.name.trim() === '';
    const isGradeEmpty = course.grade === '';
    const isCreditsEmpty = course.creditHours === '';

    return (
        <div className="grid-cols">
            <input
                type="text"
                className={`input-compact ${isNameEmpty ? 'error' : ''}`}
                placeholder="Course Name"
                maxLength={50}
                value={course.name}
                onChange={(e) => updateCourse(semesterId, course.id, { name: e.target.value })}
            />
            <select
                className={`select-compact ${isGradeEmpty ? 'error' : ''}`}
                value={course.grade}
                onChange={(e) => updateCourse(semesterId, course.id, { grade: e.target.value as Grade })}
            >
                {grades.map((g) => (
                    <option key={g} value={g}>
                        {g === '' ? '-' : g}
                    </option>
                ))}
            </select>
            <input
                type="number"
                className={`input-compact mini ${isCreditsEmpty ? 'error' : ''}`}
                placeholder="0"
                min="0"
                max="9"
                value={course.creditHours}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (/^\d$/.test(val) && Number(val) >= 0 && Number(val) <= 9)) {
                        updateCourse(semesterId, course.id, { creditHours: val === '' ? '' : Number(val) });
                    }
                }}
            />
            <button
                className="btn-icon-danger"
                onClick={() => removeCourse(semesterId, course.id)}
                aria-label="Remove Course"
            >
                ✕
            </button>
        </div>
    );
}
