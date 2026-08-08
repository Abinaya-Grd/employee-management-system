import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'

const emptyForm = { username: '', email: '', password: '', confirm_password: '' }

export default function Register() {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (form.password !== form.confirm_password) {
      setErrors({ confirm_password: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      await client.post('/register', form)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        
        setErrors(data)
      } else {
        setErrors({ detail: 'Registration failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (field) => errors[field] && (
    <span className="field-error">{Array.isArray(errors[field]) ? errors[field][0] : errors[field]}</span>
  )

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Employee Management</h1>
        <p className="subtitle">Create your account</p>
        {errors.detail && <div className="alert-error">{errors.detail}</div>}

        <label>Username</label>
        <input value={form.username} onChange={handleChange('username')} required autoFocus />
        {fieldError('username')}

        <label>Email</label>
        <input type="email" value={form.email} onChange={handleChange('email')} required />
        {fieldError('email')}

        <label>Password</label>
        <input type="password" value={form.password} onChange={handleChange('password')} required />
        {fieldError('password')}

        <label>Confirm Password</label>
        <input type="password" value={form.confirm_password} onChange={handleChange('confirm_password')} required />
        {fieldError('confirm_password')}

        <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        <p className="hint"><Link to="/login">Already have an account? Login</Link></p>
      </form>
    </div>
  )
}
