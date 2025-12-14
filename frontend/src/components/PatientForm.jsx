import React, { useState } from 'react';

export default function PatientForm({ initial = {}, onSubmit, submitLabel = 'Save' }) {
  const [form, setForm] = useState({
    firstName: initial.firstName || '',
    lastName: initial.lastName || '',
    username: initial.username || '',
    password: initial.password || '',
    dob: initial.dob ? initial.dob.slice(0,10) : '',
    gender: initial.gender || 'male',
    phone: initial?.contact?.phone || '',
    email: initial?.contact?.email || '',
    address: initial?.contact?.address || ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
      password: form.password,
      dob: form.dob ? new Date(form.dob).toISOString() : undefined,
      gender: form.gender,
      contact: { phone: form.phone, email: form.email, address: form.address }
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" required />
        <input name.="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input name="dob" type="date" value={form.dob} onChange={handleChange} />
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
      <div>
        <button type="submit" style={{ padding: '6px 12px' }}>{submitLabel}</button>
      </div>
    </form>
  );
}
