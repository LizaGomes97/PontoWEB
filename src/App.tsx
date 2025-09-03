import React, { useState } from 'react';
import { AuthProvider, useAuth, User } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import { LoginForm } from './components/LoginForm';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';
import { TimesheetView } from './components/TimesheetView';
import { SettingsView } from './components/SettingsView';
import { Toaster } from './components/ui/sonner';

type AppView = 'dashboard' | 'timesheet' | 'settings';

function AppContent() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  const handleViewEmployeeTimesheet = (employee: User) => {
    setSelectedEmployee(employee);
    setCurrentView('timesheet');
  };
  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };

  const handleBack = () => {
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setCurrentView('dashboard');
  };

  if (!user) {
    return <LoginForm />;
  }

  if (currentView === 'settings') {
    return <SettingsView onBack={handleBack} />;
  }

  if (currentView === 'timesheet') {
    // Se for um gestor vendo um funcionário, passe o 'selectedEmployee'
    // Se for um funcionário vendo a si mesmo, 'selectedEmployee' será nulo, e o componente funcionará como antes
    return <TimesheetView onBack={handleBack} employee={selectedEmployee} />;
  }

  // Dashboard view
  if (user.type === 'employee') {
    return (
      <EmployeeDashboard
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    );
  } else {
    return (
      <EmployerDashboard
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onViewEmployee={handleViewEmployeeTimesheet}
      />
    );
  }
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AccessibilityProvider>
          <div className="antialiased min-h-screen">
            {/* Skip to main content link for screen readers */}
            <a 
              href="#main-content" 
              className="skip-link"
              onFocus={(e) => e.target.scrollIntoView()}
            >
              Pular para o conteúdo principal
            </a>
            
            <main id="main-content" role="main" tabIndex={-1}>
              <AppContent />
            </main>
            
            {/* Toast notifications */}
            <Toaster 
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
          </div>
        </AccessibilityProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}