import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'

const emptyForm = {
  name: '', email: '', phone: '', gender: 'M', dob: '', department: '',
  designation: '', salary: '', joining_date: '',
}

export default function EmployeeForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [departments, setDepartments] = useState([])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    client.get('/departments?page_size=100').then(({ data }) => setDepartments(data.results || data))
    if (isEdit) {
      client.get(`/employees/${id}`).then(({ data }) => {
        setForm({
          name: data.name, email: data.email, phone: data.phone, gender: data.gender,
          dob: data.dob, department: data.department, designation: data.designation,
          salary: data.salary, joining_date: data.joining_date,
        })
        setCurrentImage(data.profile_image)
      })
    }
  }, [id])

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)

    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    if (imageFile) payload.append('profile_image', imageFile)

    try {
      if (isEdit) {
        await client.put(`/employees/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await client.post('/employees', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      navigate('/employees')
    } catch (err) {
      setErrors(err.response?.data || { detail: 'Something went wrong.' })
    } finally {
      setSaving(false)
    }
  }

  const fieldError = (field) => errors[field] && (
    <span className="field-error">{Array.isArray(errors[field]) ? errors[field][0] : errors[field]}</span>
  )

  return (
    <div>
      <h1>{isEdit ? 'Edit' : 'Add'} Employee</h1>
      <form className="stacked-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label>Name</label>
            <input value={form.name} onChange={handleChange('name')} required />
            {fieldError('name')}
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={handleChange('email')} required />
            {fieldError('email')}
          </div>
          <div className="form-field">
            <label>Phone (10 digits)</label>
            <input value={form.phone} onChange={handleChange('phone')} maxLength={10} required />
            {fieldError('phone')}
          </div>
          <div className="form-field">
            <label>Gender</label>
            <select value={form.gender} onChange={handleChange('gender')}>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
          <div className="form-field">
            <label>Date of Birth</label>
            <input type="date" value={form.dob} onChange={handleChange('dob')} required />
            {fieldError('dob')}
          </div>
          <div className="form-field">
            <label>Department</label>
            <select value={form.department} onChange={handleChange('department')} required>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {fieldError('department')}
          </div>
          <div className="form-field">
            <label>Designation</label>
            <input value={form.designation} onChange={handleChange('designation')} required />
            {fieldError('designation')}
          </div>
          <div className="form-field">
            <label>Salary</label>
            <input type="number" min="0" step="0.01" value={form.salary} onChange={handleChange('salary')} required />
            {fieldError('salary')}
          </div>
          <div className="form-field">
            <label>Joining Date</label>
            <input type="date" value={form.joining_date} onChange={handleChange('joining_date')} required />
            {fieldError('joining_date')}
          </div>
          <div className="form-field">
            <label>Profile Image</label>
            {currentImage && <img src={currentImage} alt="current" className="avatar" />}
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            {fieldError('profile_image')}
          </div>
        </div>

        {errors.detail && <div className="alert-error">{errors.detail}</div>}

        <div className="form-actions">
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Employee'}</button>
          <button type="button" className="secondary" onClick={() => navigate('/employees')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
