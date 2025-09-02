import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserType = 'employee' | 'employer';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  companyId?: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  totalHours?: number;
}

interface AuthContextType {
  user: User | null;
  employees: User[];
  timeEntries: TimeEntry[];
  login: (email: string, password: string, type: UserType) => Promise<boolean>;
  register: (name: string, email: string, password: string, type: UserType) => Promise<boolean>;
  logout: () => void;
  checkIn: (location: { latitude: number; longitude: number; address: string }) => void;
  checkOut: (location: { latitude: number; longitude: number; address: string }) => void;
  addEmployee: (employee: Omit<User, 'id'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data
const mockEmployees: User[] = [
  { id: '1', name: 'João Silva', email: 'joao@empresa.com', type: 'employee', companyId: 'company1' },
  { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', type: 'employee', companyId: 'company1' },
  { id: '3', name: 'Pedro Oliveira', email: 'pedro@empresa.com', type: 'employee', companyId: 'company1' },
];

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    employeeId: '1',
    date: '2025-01-15',
    checkIn: '08:00',
    checkOut: '17:00',
    location: { latitude: -23.5505, longitude: -46.6333, address: 'São Paulo, SP' },
    totalHours: 8
  },
  {
    id: '2',
    employeeId: '1',
    date: '2025-01-14',
    checkIn: '08:15',
    checkOut: '17:15',
    location: { latitude: -23.5505, longitude: -46.6333, address: 'São Paulo, SP' },
    totalHours: 8
  },
  {
    id: '3',
    employeeId: '2',
    date: '2025-01-15',
    checkIn: '09:00',
    checkOut: '18:00',
    location: { latitude: -23.5505, longitude: -46.6333, address: 'São Paulo, SP' },
    totalHours: 8
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>(mockEmployees);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries);

  const login = async (email: string, password: string, type: UserType): Promise<boolean> => {
    // Mock login logic
    if (type === 'employer') {
      setUser({
        id: 'employer1',
        name: 'Gestor Principal',
        email: email,
        type: 'employer',
      });
    } else {
      const employee = mockEmployees.find(emp => emp.email === email);
      if (employee) {
        setUser(employee);
      } else {
        setUser({
          id: 'emp1',
          name: 'Funcionário Teste',
          email: email,
          type: 'employee',
          companyId: 'company1'
        });
      }
    }
    return true;
  };

  const register = async (name: string, email: string, password: string, type: UserType): Promise<boolean> => {
    // Mock registration logic
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      type,
      companyId: type === 'employee' ? 'company1' : undefined
    };
    
    if (type === 'employee') {
      setEmployees(prev => [...prev, newUser]);
    }
    
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number; address: string }> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: 'Localização Atual' // In a real app, you'd reverse geocode this
            });
          },
          () => {
            // Fallback to mock location
            resolve({
              latitude: -23.5505,
              longitude: -46.6333,
              address: 'São Paulo, SP'
            });
          }
        );
      } else {
        resolve({
          latitude: -23.5505,
          longitude: -46.6333,
          address: 'São Paulo, SP'
        });
      }
    });
  };

  const checkIn = async (location: { latitude: number; longitude: number; address: string }) => {
    if (!user || user.type !== 'employee') return;

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const existingEntry = timeEntries.find(
      entry => entry.employeeId === user.id && entry.date === today
    );

    if (existingEntry) {
      // Update existing entry
      setTimeEntries(prev => 
        prev.map(entry => 
          entry.id === existingEntry.id 
            ? { ...entry, checkIn: currentTime, location }
            : entry
        )
      );
    } else {
      // Create new entry
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        employeeId: user.id,
        date: today,
        checkIn: currentTime,
        location
      };
      setTimeEntries(prev => [...prev, newEntry]);
    }
  };

  const checkOut = async (location: { latitude: number; longitude: number; address: string }) => {
    if (!user || user.type !== 'employee') return;

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setTimeEntries(prev => 
      prev.map(entry => {
        if (entry.employeeId === user.id && entry.date === today) {
          const checkInTime = entry.checkIn;
          let totalHours = 0;
          
          if (checkInTime) {
            const [checkInHour, checkInMin] = checkInTime.split(':').map(Number);
            const [checkOutHour, checkOutMin] = currentTime.split(':').map(Number);
            
            const checkInMinutes = checkInHour * 60 + checkInMin;
            const checkOutMinutes = checkOutHour * 60 + checkOutMin;
            
            totalHours = Math.round((checkOutMinutes - checkInMinutes) / 60 * 100) / 100;
          }

          return {
            ...entry,
            checkOut: currentTime,
            location,
            totalHours
          };
        }
        return entry;
      })
    );
  };

  const addEmployee = (employee: Omit<User, 'id'>) => {
    const newEmployee: User = {
      ...employee,
      id: Date.now().toString(),
      companyId: user?.type === 'employer' ? 'company1' : employee.companyId
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      employees,
      timeEntries,
      login,
      register,
      logout,
      checkIn,
      checkOut,
      addEmployee
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}