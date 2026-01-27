import { Course, GRADE_POINTS } from '../types';

const isCourseComplete = (course: Course): boolean => {
    return (
        course.name.trim() !== '' &&
        course.grade !== '' &&
        course.creditHours !== '' &&
        course.creditHours > 0
    );
};

export const calculateGPA = (courses: Course[]): number => {
    const completeCourses = courses.filter(isCourseComplete);

    if (completeCourses.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    completeCourses.forEach((course) => {
        if (course.grade !== '' && course.creditHours !== '') {
            const points = GRADE_POINTS[course.grade];
            totalPoints += points * course.creditHours;
            totalCredits += course.creditHours;
        }
    });

    return totalCredits === 0 ? 0 : totalPoints / totalCredits;
};

export const calculateCGPA = (semesters: { courses: Course[] }[]): number => {
    let totalPoints = 0;
    let totalCredits = 0;

    semesters.forEach((semester) => {
        const completeCourses = semester.courses.filter(isCourseComplete);
        completeCourses.forEach((course) => {
            if (course.grade !== '' && course.creditHours !== '') {
                const points = GRADE_POINTS[course.grade];
                totalPoints += points * course.creditHours;
                totalCredits += course.creditHours;
            }
        });
    });

    return totalCredits === 0 ? 0 : totalPoints / totalCredits;
};
