import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getPublicCompanySettings } from './api';
import { CompanySettings } from '../../shared/types';
import { useAuth } from '../../shared/auth';
import { login as loginApi, register as registerApi } from '../auth/api';

export const HomePage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState('buyer');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerCompanyName, setRegisterCompanyName] = useState('');
  const [registerGstNumber, setRegisterGstNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  useEffect(() => {
    if (token && user) {
      const basePath =
        user.role === 'admin' || user.role === 'super_admin'
          ? '/admin'
          : user.role === 'seller'
            ? '/seller'
            : '/buyer';
      navigate(`${basePath}/dashboard`, { replace: true });
      return;
    }
    getPublicCompanySettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, [navigate, token, user]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const result = await loginApi(loginEmail, loginPassword);
      login(result.token, result.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await registerApi({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
        phone: registerPhone || undefined,
        address: registerAddress || undefined,
        companyName: registerCompanyName || undefined,
        gstNumber: registerGstNumber || undefined
      });
      setTab('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="bg-light">
      <header className="border-bottom bg-white">
        <div className="container py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Company logo" style={{ width: 48, height: 48 }} />
            ) : (
              <div className="logo-mark">I</div>
            )}
            <div>
              <strong className="d-block">{settings?.name ?? 'Inventory Control'}</strong>
              <small className="text-muted">{settings?.tagline ?? 'Operate faster with clear stock visibility.'}</small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={() => setTab('login')}>
              Login
            </button>
            <button className="btn btn-primary" onClick={() => setTab('register')}>
              Register
            </button>
          </div>
        </div>
      </header>

      <main className="container py-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-6">
            <h1 className="display-6 fw-semibold mb-3">
              {settings?.tagline ?? 'Inventory, purchasing, and sales in one place.'}
            </h1>
            <p className="text-muted">
              {settings?.description ??
                'Centralize inventory, suppliers, and customer orders. Track approvals, fulfillment, and margins with real-time dashboards.'}
            </p>
            <div className="row g-3 mt-4">
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">Inventory Accuracy</h6>
                    <p className="text-muted mb-0">
                      Track stock, locations, and reorder points with clarity.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">Order Workflows</h6>
                    <p className="text-muted mb-0">
                      Approvals, receiving, and fulfillment built in.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">Analytics</h6>
                    <p className="text-muted mb-0">
                      Dashboards for margins, stock health, and trends.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">Role-Based Access</h6>
                    <p className="text-muted mb-0">
                      Admin, seller, and buyer visibility tailored to each user.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="btn-group w-100 mb-3" role="group">
                  <button
                    className={`btn ${tab === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setTab('login')}
                    type="button"
                  >
                    Login
                  </button>
                  <button
                    className={`btn ${tab === 'register' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setTab('register')}
                    type="button"
                  >
                    Register
                  </button>
                </div>

                {error ? <div className="alert alert-danger">{error}</div> : null}

                {tab === 'login' ? (
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        className="form-control"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button className="btn btn-primary w-100" type="submit">
                      Login
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        className="form-control"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={registerRole}
                        onChange={(e) => setRegisterRole(e.target.value)}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Company Name</label>
                      <input
                        className="form-control"
                        value={registerCompanyName}
                        onChange={(e) => setRegisterCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">GST Number</label>
                      <input
                        className="form-control"
                        value={registerGstNumber}
                        onChange={(e) => setRegisterGstNumber(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        className="form-control"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input
                        className="form-control"
                        value={registerAddress}
                        onChange={(e) => setRegisterAddress(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary w-100" type="submit">
                      Register
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-top bg-white">
        <div className="container py-4">
          <div className="row g-3">
            <div className="col-12 col-lg-4">
              <strong>{settings?.name ?? 'Inventory Control'}</strong>
              <p className="text-muted small mb-0">
                {settings?.tagline ?? 'Operate faster with clear stock visibility.'}
              </p>
            </div>
            <div className="col-12 col-lg-4">
              <div className="fw-semibold">Contact</div>
              <div className="text-muted small">Phone: +91-90000-00000</div>
              <div className="text-muted small">Email: support@company.com</div>
              <div className="text-muted small">Address: Business Park, City</div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="fw-semibold">Links</div>
              {settings?.websiteUrl ? (
                <a href={settings.websiteUrl} target="_blank" rel="noreferrer">
                  {settings.websiteUrl}
                </a>
              ) : (
                <span className="text-muted small">Company site not set</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
