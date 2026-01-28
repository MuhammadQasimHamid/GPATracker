'use client';

import { useGPA } from '../context/GPAContext';
import Semester from '../components/Semester';
import Sidebar from '../components/Sidebar';
import { useInstall } from './InstallPrompt';

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
                        semesters.map((s) => <Semester key={s.id} semester={s} />)
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
