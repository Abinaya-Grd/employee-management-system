import { useEffect, useState } from 'react'
import client from '../api/client'
import { Pencil, Trash2 } from 'lucide-react'
const emptyForm = { name: '', description: '' }

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)

  const loadDepartments = async () => {
    setLoading(true)
    const { data } = await client.get('/departments')
    setDepartments(data.results || data)
    setLoading(false)
  }

  useEffect(() => { loadDepartments() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      if (editingId) {
        await client.put(`/departments/${editingId}`, form)
      } else {
        await client.post('/departments', form)
      }
      setForm(emptyForm)
      setEditingId(null)
      loadDepartments()
    } catch (err) {
      setErrors(err.response?.data || { detail: 'Something went wrong.' })
    }
  }

  const handleEdit = (dept) => {
    setEditingId(dept.id)
    setForm({ name: dept.name, description: dept.description || '' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this department? Employees in it will be unassigned.')) return
    await client.delete(`/departments/${id}`)
    loadDepartments()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
  }

  return (
    <div>
      <h1>Departments</h1>

      <form className="inline-form" onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="Department name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          {errors.name && <span className="field-error">{errors.name[0] || errors.name}</span>}
        </div>
        <div>
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <button type="submit">{editingId ? 'Update' : 'Add'} Department</button>
        {editingId && <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>}
      </form>

      {loading ? <p>Loading...</p> : (
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Description</th><th>Employees</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.name}</td>
                <td>{dept.description || '-'}</td>
                <td>{dept.employee_count}</td>
                <td className="actions">
  <button
    className="icon-btn edit-btn"
    onClick={() => handleEdit(dept)}
    title="Edit Department"
    aria-label="Edit Department"
  >
    <Pencil size={17} />
  </button>

  <button
    className="icon-btn delete-btn"
    onClick={() => handleDelete(dept.id)}
    title="Delete Department"
    aria-label="Delete Department"
  >
    <Trash2 size={17} />
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
