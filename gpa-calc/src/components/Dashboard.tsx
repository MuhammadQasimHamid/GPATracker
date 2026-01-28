'use client';

import { useGPA } from '../context/GPAContext';
import Semester from '../components/Semester';
import Sidebar from '../components/Sidebar';
import { useInstall } from './InstallPrompt';
import { GRADE_POINTS } from '../types';

export default function Dashboard() {
    const { semesters, addSemester } = useGPA();
    const { handleInstallClick } = useInstall();

    return (
        <div className="layout-wrapper">
            {/* Left Column: Ads */}
            <div className="ad-column left-ad">
                <div className="ad-content">
                    {/* Ads removed */}
                </div>
            </div>

            {/* Middle Column: Main Content */}
            <main className="main-content">
                <div className="header-container">
                    <h1 className="title-left" style={{ marginBottom: 0 }}>GPA Saver</h1>
                    <button className="btn btn-header-install" onClick={handleInstallClick}>
                        <span>󰐖</span> Add to Home Screen
                    </button>
                </div>

                <div className="mobile-only">
                    <Sidebar />
                </div>

                <div className="semesters-controls" style={{ marginBottom: '1rem' }}>
                    <button className="btn btn-primary add-semester-btn" onClick={addSemester}>
                        + Add Semester
                    </button>
                </div>

                <div className="semesters-list">
                    {semesters.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>
                                No semesters added yet. Start by adding your first semester!
                            </p>
                        </div>
                    ) : (
                        semesters.map((s, index) => {
                            const previousSemesters = semesters.slice(0, index + 1);
                            let cumPoints = 0;
                            let cumCredits = 0;

                            previousSemesters.forEach(sem => {
                                sem.courses.forEach(c => {
                                    if (c.grade && c.creditHours && Number(c.creditHours) > 0) {
                                        cumPoints += (GRADE_POINTS[c.grade] * Number(c.creditHours));
                                        cumCredits += Number(c.creditHours);
                                    }
                                });
                            });

                            const runningCGPA = cumCredits === 0 ? 0 : cumPoints / cumCredits;

                            return <Semester key={s.id} semester={s} runningCGPA={runningCGPA} />;
                        })
                    )}
                </div>
            </main>

            {/* Right Column: CGPA & Impact */}
            <div className="sidebar-column desktop-only">
                <Sidebar />
            </div>
        </div>

    );
}
