import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { Pencil, Trash2 } from 'lucide-react'
export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const pageSize = 10

  useEffect(() => {
    client.get('/departments?page_size=100').then(({ data }) => setDepartments(data.results || data))
  }, [])

  const loadEmployees = async () => {
    setLoading(true)
    const params = { page }
    if (search) params.search = search
    if (departmentFilter) params.department = departmentFilter
    const { data } = await client.get('/employees', { params })
    setEmployees(data.results || data)
    setCount(data.count ?? (data.results || data).length)
    setLoading(false)
  }

  useEffect(() => { loadEmployees() }, [page, search, departmentFilter])

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return
    await client.delete(`/employees/${id}`)
    loadEmployees()
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  return (
    <div>
      <div className="page-header">
        <h1>Employees</h1>
        <Link to="/employees/new" className="btn-primary">+ Add Employee</Link>
      </div>

      <div className="filters">
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value) }}
        />
        <select value={departmentFilter} onChange={(e) => { setPage(1); setDepartmentFilter(e.target.value) }}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Photo</th><th>ID</th><th>Name</th><th>Email</th><th>Department</th>
                <th>Designation</th><th>Salary</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    {emp.profile_image
                      ? <img src={emp.profile_image} alt={emp.name} className="avatar" />
                      : <div className="avatar placeholder">{emp.name?.[0]}</div>}
                  </td>
                  <td>{emp.employee_id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department_detail?.name || '-'}</td>
                  <td>{emp.designation}</td>
                  <td>{Number(emp.salary).toLocaleString()}</td>
                  <td className="action-cell">
  <Link
    to={`/employees/${emp.id}/edit`}
    className="action-btn edit-btn"
    title="Edit Employee"
    aria-label="Edit Employee"
  >
    <Pencil size={16} strokeWidth={2} />
  </Link>

  <button
    type="button"
    className="action-btn delete-btn"
    onClick={() => handleDelete(emp.id)}
    title="Delete Employee"
    aria-label="Delete Employee"
  >
    <Trash2 size={16} strokeWidth={2} />
  </button>
</td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan="8" className="empty">No employees found.</td></tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  )
}
