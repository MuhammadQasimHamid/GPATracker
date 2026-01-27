'use client';

import { useGPA } from '../context/GPAContext';
import Semester from '../components/Semester';
import { calculateCGPA } from '../utils/calculations';

export default function Dashboard() {
    const { semesters, addSemester } = useGPA();
    const cgpa = calculateCGPA(semesters);

    return (
        <main className="container">
            <h1 className="title">GPA Calculator</h1>

            <div className="cgpa-display glass-card">
                <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Cumulative GPA
                </div>
                <div className="cgpa-value">{cgpa.toFixed(2)}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Semesters</h2>
                <button className="btn btn-primary" onClick={addSemester}>
                    + Add Semester
                </button>
            </div>

            <div>
                {semesters.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No semesters added yet. Click "Add Semester" to get started!
                    </p>
                ) : (
                    semesters.map((s) => <Semester key={s.id} semester={s} />)
                )}
            </div>
        </main>
    );
}
