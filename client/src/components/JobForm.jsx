import { useState } from 'react';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

export default function JobForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    title: initial?.title || '',
    company: initial?.company || '',
    location: initial?.location || '',
    type: initial?.type || 'Full-time',
    salary: initial?.salary ?? '',
    description: initial?.description || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({ ...values, salary: Number(values.salary) || 0 });
      if (!initial) setValues({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h2>{initial ? 'Edit job' : 'Post a job'}</h2>
      {error && <div className="alert error" role="alert">{error}</div>}
      <div className="form-grid">
        <div>
          <label htmlFor="title">Job title</label>
          <input id="title" name="title" value={values.title} onChange={change} required />
        </div>
        <div>
          <label htmlFor="company">Company</label>
          <input id="company" name="company" value={values.company} onChange={change} required />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input id="location" name="location" value={values.location} onChange={change} required />
        </div>
        <div>
          <label htmlFor="type">Job type</label>
          <select id="type" name="type" value={values.type} onChange={change}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="salary">Salary (per month)</label>
          <input id="salary" name="salary" type="number" min="0" value={values.salary} onChange={change} />
        </div>
        <div className="full">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={values.description} onChange={change} required />
        </div>
      </div>
      <div className="row" style={{ marginTop: '1rem' }}>
        <button className="btn" disabled={saving}>{saving ? 'Saving...' : initial ? 'Save changes' : 'Post job'}</button>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
