import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectView from './components/ProjectView';
import ProjectsArchive from './components/ProjectsArchive';
import GlobalChecker from './components/GlobalChecker';
import DevEnvironment from './components/DevEnvironment';
import Profile from './components/Profile';
import { useLanguage } from './contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

function AppContent() {
  const { t } = useLanguage();

  const { data: sprints } = useQuery<any[]>({
    queryKey: ['sprints'],
    queryFn: async () => (await api.get('/sprints')).data
  });

  const totalProjects = sprints?.reduce((acc: number, sprint: any) => acc + (sprint.projects?.length || 0), 0) || 0;

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* CodeForge Sidebar */}
      <nav className="sidebar glass">
        <div className="logo">Code<span>Forge</span></div>
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-border-all"></i> {t('navDashboard') || "Dashboard"}
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-code-branch"></i> {t('navProjects') || "Projects"}
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-list-check"></i> {t('navChecker') || "Auto-Checker"}
        </NavLink>
        <NavLink to="/environment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-terminal"></i> {t('navIDE') || "Dev Environment"}
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <i className="fa-solid fa-user-astronaut"></i> {t('navProfile') || "Profile"}
        </NavLink>
      </nav>

      {/* Main Flow Content */}
      <main className="main-content">

        {/* Universal Header with Language Toggle & Auth Profile */}
        <header className="header animate-fade">
          <div className="greeting">
            <h1>{t('greetingHeading')}</h1>
            <p>{t('greetingSub')}</p>
          </div>

          <div className="profile-area">
            {/* Language toggle moved to ProfileSettings page */}
            <div className="notification">
              <i className="fa-regular fa-bell"></i>
              {totalProjects > 0 && <span className="badge">{totalProjects}</span>}
            </div>
            <div className="avatar"></div>
          </div>
        </header>

        {/* Dynamic Route Mounts */}
        <div style={{ marginTop: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project/:projectId" element={<ProjectView />} />
            <Route path="/projects" element={<ProjectsArchive />} />
            <Route path="/tasks" element={<GlobalChecker />} />
            <Route path="/environment" element={<DevEnvironment />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>

      </main>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
