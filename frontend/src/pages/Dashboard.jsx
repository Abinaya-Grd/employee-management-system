import { useEffect, useState } from 'react'
import client from '../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard data.'))
  }, [])

  if (error) return <div className="alert-error">{error}</div>
  if (!stats) return <div>Loading...</div>

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{stats.total_employees}</span>
          <span className="stat-label">Total Employees</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.total_departments}</span>
          <span className="stat-label">Total Departments</span>
        </div>
      </div>

      <h2>Recent Employees</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Joining Date</th>
          </tr>
        </thead>
        <tbody>
          {stats.recent_employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.employee_id}</td>
              <td>{emp.name}</td>
              <td>{emp.department_detail?.name || '-'}</td>
              <td>{emp.designation}</td>
              <td>{emp.joining_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
