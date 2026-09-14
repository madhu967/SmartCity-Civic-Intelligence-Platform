import { useEffect, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, KeyRound, LogOut, Menu, Phone, ShieldCheck, UserRound, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

const departments = ['Roads and Infrastructure', 'Sanitation', 'Water Services', 'Public Safety', 'Parks and Recreation', 'Electrical Services'];
const skills = ['Road maintenance', 'Waste management', 'Plumbing', 'Emergency response', 'Landscaping', 'Electrical repair'];

const initialForm = {
  name: '', email: '', password: '', phone: '', department: departments[0], jobSkill: skills[0],
  serviceArea: '', yearsExperience: '', availability: 'Available', location: '',
};

export default function WorkerCreatePage() {
  const [admin, setAdmin] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    apiRequest('/auth/me', { headers: getAuthHeaders() }).then((data) => setAdmin(data.user)).catch((requestError) => setError(requestError.message));
  }, []);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    localStorage.removeItem('smart_city_user');
    window.dispatchEvent(new Event('auth-logout'));
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiRequest('/admin/workers', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ ...form, yearsExperience: Number(form.yearsExperience) }) });
      setForm(initialForm);
      setMessage('Worker account created. They can now log in with the email and password you provided.');
    } catch (requestError) {
      setError(requestError.details ? `${requestError.message}: ${requestError.details}` : requestError.message);
    }
  };

  if (!admin) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">{error || 'Loading worker creation...'}</main>;

  return <main className="dashboard-page min-h-screen bg-white text-slate-900"><Navbar isAuthenticated user={admin} onLogout={logout} /><aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}><div className="dashboard-sidebar-brand"><div className="dashboard-sidebar-mark">S</div><div><p className="dashboard-sidebar-title">Admin console</p><p className="dashboard-sidebar-subtitle">SmartCity platform</p></div><button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button"><X size={18} /></button></div><p className="dashboard-sidebar-label">Administration</p><nav className="dashboard-sidebar-nav"><a href="/admin" className="dashboard-sidebar-link"><ShieldCheck size={18} /><span>Admin overview</span></a><a href="/admin/users" className="dashboard-sidebar-link"><UserRound size={18} /><span>Manage users</span></a><a href="/admin/workers/new" className="dashboard-sidebar-link dashboard-sidebar-link-active"><BriefcaseBusiness size={18} /><span>Create worker</span></a></nav><div className="dashboard-sidebar-footer"><button type="button" className="dashboard-sidebar-link"><UserRound size={18} /><span>Admin profile</span></button><button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button></div></aside>{sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" />}<section className="dashboard-main"><div className="dashboard-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button"><Menu size={20} /></button><span>Create worker</span></div><div className="dashboard-container"><a href="/admin" className="profile-back-link"><ArrowLeft size={15} /> Back to admin overview</a><div className="dashboard-heading-row worker-heading-row"><div><p className="dashboard-eyebrow">Staff management</p><h1 className="dashboard-heading">Create a worker</h1><p className="dashboard-description">Create secure credentials and assign a civic service profile.</p></div></div>{message && <p className="worker-success">{message}</p>}{error && <p className="worker-error">{error}</p>}<form className="worker-form" onSubmit={submit}><div className="worker-form-section"><h2>Identity and access</h2><div className="worker-form-grid"><Field label="Full name" name="name" value={form.name} onChange={updateField} placeholder="Alex Morgan" icon={<UserRound size={16} />} /><Field label="Email address" name="email" type="email" value={form.email} onChange={updateField} placeholder="alex@smartcity.local" icon={<UserRound size={16} />} /><Field label="Phone number" name="phone" value={form.phone} onChange={updateField} placeholder="+1 555 0100" icon={<Phone size={16} />} /><Field label="Worker password" name="password" type="password" value={form.password} onChange={updateField} placeholder="Minimum 6 characters" icon={<KeyRound size={16} />} /></div></div><div className="worker-form-section"><h2>Service assignment</h2><div className="worker-form-grid"><SelectField label="Department" name="department" value={form.department} onChange={updateField} options={departments} /><SelectField label="Job / skill" name="jobSkill" value={form.jobSkill} onChange={updateField} options={skills} /><Field label="Service area / ward" name="serviceArea" value={form.serviceArea} onChange={updateField} placeholder="Ward 04 - North District" /><Field label="Location" name="location" value={form.location} onChange={updateField} placeholder="North operations hub" /><Field label="Years of experience" name="yearsExperience" type="number" min="0" value={form.yearsExperience} onChange={updateField} placeholder="5" /><SelectField label="Availability" name="availability" value={form.availability} onChange={updateField} options={['Available', 'On duty', 'Unavailable']} /></div></div><button type="submit" className="dashboard-primary-button worker-submit">Create worker account <span>→</span></button></form></div></section></main>;
}

function Field({ label, icon, ...props }) { return <label className="worker-field"><span>{icon}{label}</span><input required {...props} /></label>; }
function SelectField({ label, name, value, onChange, options }) { return <label className="worker-field"><span>{label}</span><select required name={name} value={value} onChange={onChange}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }