'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Semester, Course } from '../types';

interface GPAContextType {
    semesters: Semester[];
    addSemester: () => void;
    removeSemester: (id: string) => void;
    toggleSemester: (id: string) => void;
    renameSemester: (id: string, name: string) => void;
    moveSemesterUp: (id: string) => void;
    moveSemesterDown: (id: string) => void;
    addCourse: (semesterId: string) => void;
    updateCourse: (semesterId: string, courseId: string, updates: Partial<Course>) => void;
    removeCourse: (semesterId: string, courseId: string) => void;
}

const GPAContext = createContext<GPAContextType | undefined>(undefined);

export const GPAProvider = ({ children }: { children: ReactNode }) => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('gpa_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Force all collapsed on load
                setSemesters(parsed.map((s: any) => ({ ...s, isCollapsed: true })));
            } catch (e) {
                console.error('Failed to parse saved GPA data', e);
            }
        } else {
            // Initial load with 1 semester
            const initialId = crypto.randomUUID();
            setSemesters([{
                id: initialId,
                name: "Semester 1",
                isCollapsed: false,
                courses: Array.from({ length: 4 }).map(() => ({
                    id: crypto.randomUUID(),
                    name: '',
                    grade: '',
                    creditHours: ''
                }))
            }]);
        }
        setIsInitialized(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('gpa_data', JSON.stringify(semesters));
        }
    }, [semesters, isInitialized]);

    const addSemester = () => {
        const newSemester: Semester = {
            id: crypto.randomUUID(),
            name: `Semester ${semesters.length + 1} (Edit)`,
            courses: Array.from({ length: 4 }).map(() => ({
                id: crypto.randomUUID(),
                name: '',
                grade: '',
                creditHours: ''
            })),
            isCollapsed: false,
        };
        // Close other semesters when adding new one
        setSemesters(semesters.map(s => ({ ...s, isCollapsed: true })).concat(newSemester));
    };

    const removeSemester = (id: string) => {
        setSemesters(semesters.filter(s => s.id !== id));
    };

    const toggleSemester = (id: string) => {
        setSemesters(semesters.map(s => {
            if (s.id === id) {
                return { ...s, isCollapsed: !s.isCollapsed };
            }
            // Close all others if we are opening this one
            const currentSemester = semesters.find(sem => sem.id === id);
            if (currentSemester && currentSemester.isCollapsed) {
                return { ...s, isCollapsed: true };
            }
            return s;
        }));
    };

    const renameSemester = (id: string, name: string) => {
        setSemesters(semesters.map(s => s.id === id ? { ...s, name } : s));
    };

    const moveSemesterUp = (id: string) => {
        const index = semesters.findIndex(s => s.id === id);
        if (index > 0) {
            const newSemesters = [...semesters];
            [newSemesters[index - 1], newSemesters[index]] = [newSemesters[index], newSemesters[index - 1]];
            setSemesters(newSemesters);
        }
    };

    const moveSemesterDown = (id: string) => {
        const index = semesters.findIndex(s => s.id === id);
        if (index < semesters.length - 1) {
            const newSemesters = [...semesters];
            [newSemesters[index + 1], newSemesters[index]] = [newSemesters[index], newSemesters[index + 1]];
            setSemesters(newSemesters);
        }
    };

    const addCourse = (semesterId: string) => {
        setSemesters(semesters.map(s => {
            if (s.id === semesterId) {
                const newCourse: Course = {
                    id: crypto.randomUUID(),
                    name: '',
                    creditHours: '',
                    grade: '',
                };
                return { ...s, courses: [...s.courses, newCourse], isCollapsed: false };
            }
            return s;
        }));
    };

    const updateCourse = (semesterId: string, courseId: string, updates: Partial<Course>) => {
        setSemesters(semesters.map(s => {
            if (s.id === semesterId) {
                return {
                    ...s,
                    courses: s.courses.map(c => c.id === courseId ? { ...c, ...updates } : c)
                };
            }
            return s;
        }));
    };

    const removeCourse = (semesterId: string, courseId: string) => {
        setSemesters(semesters.map(s => {
            if (s.id === semesterId) {
                return {
                    ...s,
                    courses: s.courses.filter(c => c.id !== courseId)
                };
            }
            return s;
        }));
    };

    return (
        <GPAContext.Provider value={{
            semesters, addSemester, removeSemester, toggleSemester, renameSemester, moveSemesterUp, moveSemesterDown, addCourse, updateCourse, removeCourse
        }}>
            {children}
        </GPAContext.Provider>
    );
};

export const useGPA = () => {
    const context = useContext(GPAContext);
    if (!context) throw new Error('useGPA must be used within a GPAProvider');
    return context;
};
