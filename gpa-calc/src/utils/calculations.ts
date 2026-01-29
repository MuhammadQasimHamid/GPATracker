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
    try {
        if (!courses || !Array.isArray(courses)) return 0;

        const completeCourses = courses.filter(isCourseComplete);

        if (completeCourses.length === 0) return 0;

        let totalPoints = 0;
        let totalCredits = 0;

        completeCourses.forEach((course) => {
            if (course.grade !== '' && course.creditHours !== '') {
                const points = GRADE_POINTS[course.grade];
                // Ensure points is valid number
                if (typeof points === 'number') {
                    totalPoints += points * Number(course.creditHours);
                    totalCredits += Number(course.creditHours);
                }
            }
        });

        return totalCredits === 0 ? 0 : totalPoints / totalCredits;
    } catch (e) {
        console.error('Calculations Error (GPA):', e);
        return 0;
    }
};

export const calculateCGPA = (semesters: { courses: Course[] }[]): number => {
    try {
        if (!semesters || !Array.isArray(semesters)) return 0;

        let totalPoints = 0;
        let totalCredits = 0;

        semesters.forEach((semester) => {
            if (!semester.courses || !Array.isArray(semester.courses)) return;

            const completeCourses = semester.courses.filter(isCourseComplete);
            completeCourses.forEach((course) => {
                if (course.grade !== '' && course.creditHours !== '') {
                    const points = GRADE_POINTS[course.grade];
                    if (typeof points === 'number') {
                        totalPoints += points * Number(course.creditHours);
                        totalCredits += Number(course.creditHours);
                    }
                }
            });
        });

        return totalCredits === 0 ? 0 : totalPoints / totalCredits;
    } catch (e) {
        console.error('Calculations Error (CGPA):', e);
        return 0;
    }
};
