import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5084/api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('workspace_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAdmin = user?.role === 'Admin';

  // Состояния для авторизации
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Состояния для бронирования
  const [workplaces, setWorkplaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(null);
  const [date, setDate] = useState('2026-11-12');
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('15:00');
  const [statusMsg, setStatusMsg] = useState(null);

  // Состояния для панели администратора
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');
  const [adminMsg, setAdminMsg] = useState(null);

  useEffect(() => {
    if (user) {
      fetchWorkplaces();
      fetchBookings();
    }
  }, [user]);

  const fetchWorkplaces = async () => {
    try {
      const res = await fetch(`${API_URL}/Workplaces`);
      const data = await res.json();
      setWorkplaces(data);
      if (data.length > 0 && !selectedWorkplaceId) {
        setSelectedWorkplaceId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load workplaces:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/Bookings`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'register' ? 'register' : 'login';

    try {
      const res = await fetch(`${API_URL}/Users/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        const userData = await res.json();
        localStorage.setItem('workspace_user', JSON.stringify(userData));
        setUser(userData);
        setShowAdminPanel(false);
      } else {
        const errText = await res.text();
        setAuthError(errText || 'Authentication failed.');
      }
    } catch {
      setAuthError('Server connection error.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('workspace_user');
    setUser(null);
    setShowAdminPanel(false);
  };

  const handleCreateWorkplace = async (e) => {
    e.preventDefault();
    setAdminMsg(null);

    try {
      const res = await fetch(`${API_URL}/Workplaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSpaceName,
          description: newSpaceDesc || 'Standard workspace',
          isActive: true,
        }),
      });

      if (res.ok) {
        setNewSpaceName('');
        setNewSpaceDesc('');
        setAdminMsg({ type: 'success', text: 'New workspace added to the floor plan!' });
        fetchWorkplaces();
      } else {
        setAdminMsg({ type: 'error', text: 'Failed to create workspace.' });
      }
    } catch {
      setAdminMsg({ type: 'error', text: 'Server error.' });
    }
  };

  const handleDeleteWorkplace = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this workspace? All associated bookings will also be removed.')) return;

    const res = await fetch(`${API_URL}/Workplaces/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (selectedWorkplaceId === id) setSelectedWorkplaceId(null);
      fetchWorkplaces();
      fetchBookings();
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!selectedWorkplaceId) {
      setStatusMsg({ type: 'error', text: 'Please select a workspace on the map.' });
      return;
    }

    const payload = {
      userId: user.id,
      workplaceId: selectedWorkplaceId,
      date,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
    };

    try {
      const res = await fetch(`${API_URL}/Bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Workspace booked successfully!' });
        fetchBookings();
      } else {
        const errText = await res.text();
        setStatusMsg({ type: 'error', text: `Error: ${errText}` });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Network error while booking.' });
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    const res = await fetch(`${API_URL}/Bookings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchBookings();
    }
  };

  const isDeskBusy = (wpId) => {
    return bookings.some(
      (b) =>
        b.workplaceId === wpId &&
        b.date === date &&
        b.startTime.slice(0, 5) < endTime &&
        startTime < b.endTime.slice(0, 5)
    );
  };

  if (!user) {
    return (
      <div className="container auth-container">
        <div className="card">
          <div className="tabs">
            <button
              type="button"
              className={`tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
            >
              Login
            </button>
            <button
              type="button"
              className={`tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth}>
            {authMode === 'register' && (
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="admin@admin.com or user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="primary-btn">
              {authMode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {authError && <div className="msg error">{authError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>
            Logged in as: <strong>{user.username}</strong> ({user.email})
          </span>
          {isAdmin && (
            <span style={{
              background: '#007aff',
              color: 'white',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '3px 7px',
              borderRadius: '4px'
            }}>
              ADMIN
            </span>
          )}
        </div>

        <div className="header-actions">
          {isAdmin && (
            <button
              className={`manage-btn ${showAdminPanel ? 'active' : ''}`}
              onClick={() => { setShowAdminPanel(!showAdminPanel); setAdminMsg(null); }}
            >
              {showAdminPanel ? 'Close Panel' : '+ Manage Spaces'}
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ПАНЕЛЬ ДОСТУПНА ТОЛЬКО ДЛЯ АДМИНИСТРАТОРА */}
      {isAdmin && showAdminPanel && (
        <div className="card admin-card">
          <h2>Add New Workspace</h2>
          <form onSubmit={handleCreateWorkplace} className="admin-grid">
            <div>
              <label>Workspace Name:</label>
              <input
                type="text"
                placeholder="e.g., Desk 2 or Meeting Room A"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Location / Description:</label>
              <input
                type="text"
                placeholder="e.g., Window Side, 2nd Floor"
                value={newSpaceDesc}
                onChange={(e) => setNewSpaceDesc(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="primary-btn" style={{ padding: '10px' }}>
                Add Space
              </button>
            </div>
          </form>
          {adminMsg && <div className={`msg ${adminMsg.type}`}>{adminMsg.text}</div>}
        </div>
      )}

      <div className="card">
        <h2>1. Select Date & Time</h2>
        <div className="time-grid">
          <div>
            <label>Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label>Start Time:</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>
          <div>
            <label>End Time:</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>

        <h2 style={{ marginTop: '24px' }}>2. Choose a Workspace on the Floor Plan</h2>
        <div className="floor-plan">
          {workplaces.map((wp) => {
            const busy = isDeskBusy(wp.id);
            const isSelected = selectedWorkplaceId === wp.id;

            return (
              <div
                key={wp.id}
                onClick={() => setSelectedWorkplaceId(wp.id)}
                className={`desk-card ${isSelected ? 'selected' : ''} ${busy ? 'busy' : 'available'}`}
              >
                {isAdmin && showAdminPanel && (
                  <button
                    type="button"
                    className="delete-space-btn"
                    title="Delete workspace"
                    onClick={(e) => handleDeleteWorkplace(e, wp.id)}
                  >
                    ×
                  </button>
                )}
                <div className="desk-title">{wp.name}</div>
                <div className="desk-desc">{wp.description || 'Standard workspace'}</div>
                <span className={`badge ${busy ? 'badge-busy' : 'badge-free'}`}>
                  {busy ? 'Occupied' : 'Available'}
                </span>
              </div>
            );
          })}
        </div>

        <button onClick={handleBook} className="primary-btn" style={{ marginTop: '20px' }}>
          Book Selected Workspace
        </button>

        {statusMsg && <div className={`msg ${statusMsg.type}`}>{statusMsg.text}</div>}
      </div>

      <div className="card">
        <h2>Active Bookings</h2>
        <table>
          <thead>
            <tr>
              <th>Workspace</th>
              <th>User</th>
              <th>Date</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">No active bookings yet.</td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.workplace ? b.workplace.name : `Desk #${b.workplaceId}`}</strong></td>
                  <td>{b.user ? b.user.username : `User #${b.userId}`}</td>
                  <td>{b.date}</td>
                  <td>{b.startTime.slice(0, 5)} – {b.endTime.slice(0, 5)}</td>
                  <td>
                    {b.userId === user.id || isAdmin ? (
                      <button className="cancel-btn" onClick={() => handleDeleteBooking(b.id)}>
                        Cancel
                      </button>
                    ) : (
                      <span className="booked-label">Booked</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
