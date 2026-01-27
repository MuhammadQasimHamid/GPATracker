import { Course, GRADE_POINTS } from '../types';

export const calculateGPA = (courses: Course[]): number => {
    if (courses.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
        const points = GRADE_POINTS[course.grade];
        totalPoints += points * course.creditHours;
        totalCredits += course.creditHours;
    });

    return totalCredits === 0 ? 0 : totalPoints / totalCredits;
};

export const calculateCGPA = (semesters: { courses: Course[] }[]): number => {
    let totalPoints = 0;
    let totalCredits = 0;

    semesters.forEach((semester) => {
        semester.courses.forEach((course) => {
            const points = GRADE_POINTS[course.grade];
            totalPoints += points * course.creditHours;
            totalCredits += course.creditHours;
        });
    });

    return totalCredits === 0 ? 0 : totalPoints / totalCredits;
};
