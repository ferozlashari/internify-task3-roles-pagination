export default function JobCard({ job, canModify, onEdit, onDelete }) {
  return (
    <article className="job">
      <div className="job-body">
        <div className="row spread">
          <h3>{job.title}</h3>
          <span className="badge">{job.type}</span>
        </div>
        <div className="muted small">{job.company} - {job.location}</div>
        <p>{job.description}</p>
        <div className="muted small">
          Salary: {job.salary ? job.salary.toLocaleString() : 'Not disclosed'}
          {job.createdBy?.name && <> | Posted by {job.createdBy.name}</>}
        </div>
        {canModify && (
          <div className="row" style={{ marginTop: '0.75rem' }}>
            <button className="btn ghost small" onClick={() => onEdit(job)}>Edit</button>
            <button className="btn danger small" onClick={() => onDelete(job)}>Delete</button>
          </div>
        )}
      </div>
    </article>
  );
}
