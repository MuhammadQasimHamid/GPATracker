'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Semester, Course } from '../types';

interface GPAContextType {
    semesters: Semester[];
    addSemester: () => void;
    removeSemester: (id: string) => void;
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
                setSemesters(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved GPA data', e);
            }
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
            name: `Semester ${semesters.length + 1}`,
            courses: [],
        };
        setSemesters([...semesters, newSemester]);
    };

    const removeSemester = (id: string) => {
        setSemesters(semesters.filter(s => s.id !== id));
    };

    const addCourse = (semesterId: string) => {
        setSemesters(semesters.map(s => {
            if (s.id === semesterId) {
                const newCourse: Course = {
                    id: crypto.randomUUID(),
                    name: '',
                    creditHours: 3,
                    grade: 'A',
                };
                return { ...s, courses: [...s.courses, newCourse] };
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
        <GPAContext.Provider value={{ semesters, addSemester, removeSemester, addCourse, updateCourse, removeCourse }}>
            {children}
        </GPAContext.Provider>
    );
};

export const useGPA = () => {
    const context = useContext(GPAContext);
    if (!context) throw new Error('useGPA must be used within a GPAProvider');
    return context;
};
