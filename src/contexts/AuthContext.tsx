import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        // Limpa os dados quando o usuário desloga
        setEmployees([]);
        setTimeEntries([]);
        return;
      }

      try {
        if (user.type === 'employee') {
          // Lógica do funcionário (já existente)
          const entriesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/time-entries/${user.id}`);
          if (entriesResponse.ok) {
            setTimeEntries(await entriesResponse.json());
          }
        } else if (user.type === 'employer') {
          // --- NOVA LÓGICA DO GESTOR ---
          const [employeesResponse, entriesResponse] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employees`),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/time-entries`)
          ]);

          if (employeesResponse.ok) {
            setEmployees(await employeesResponse.json());
          }
          if (entriesResponse.ok) {
            setTimeEntries(await entriesResponse.json());
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, [user]); // Roda sempre que o usuário logado muda

  const login = async (email: string, password: string, type: UserType): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        toast.error('Credenciais inválidas. Verifique seu e-mail e senha.');
        console.error('Falha no login');
        return false;
      }

      const loggedUser: User = await response.json();

      // Verifica se o tipo de usuário que tentou logar corresponde ao do banco
      if (loggedUser.type !== type) {
        toast.error('Você está tentando acessar o painel errado (Funcionário/Gestor).');
        console.error('Tipo de usuário incorreto');
        // toast.error('Você está tentando logar no painel errado (Funcionário/Gestor)');
        return false;
      }

      setUser(loggedUser);
      return true;
    } catch (error) {
      console.error('Falha ao conectar com o servidor:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, type: UserType): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, type }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Apenas lança o erro para quem chamou a função (o LoginForm)
      throw new Error(errorData.message || 'Erro desconhecido no registro.');
    }

    const newUser: User = await response.json();

    setUser(newUser);

    if (newUser.type === 'employee') {
      setEmployees(prev => [...prev, newUser]);
    }

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

  // src/contexts/AuthContext.tsx

  const checkIn = async (location: { latitude: number; longitude: number; address: string }) => {
    if (!user || user.type !== 'employee') return;

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/time-entries/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.id,
          date: today,
          time: currentTime,
          location,
        }),
      });
      if (response.ok) {
        const newEntry = await response.json();
        setTimeEntries(prev => [newEntry, ...prev]); // Adiciona o novo registro no topo da lista
      }
    } catch (error) {
      console.error('Erro no check-in:', error);
    }
  };

  const checkOut = async (location: { latitude: number; longitude: number; address: string }) => {
    if (!user || user.type !== 'employee') return;

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    try {
        const response = await fetch('${import.meta.env.VITE_API_BASE_URL}/api/time-entries/check-out', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employeeId: user.id,
                date: today,
                time: currentTime,
            }),
        });
        if (response.ok) {
            const updatedEntry = await response.json();
            // Atualiza o registro existente na lista
            setTimeEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
        }
    } catch (error) {
        console.error('Erro no check-out:', error);
    }
  };

  const addEmployee = async (employeeData: Omit<User, 'id' | 'type' | 'companyId'>): Promise<boolean> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
            const error = await response.json();
            toast.error(error.message || 'Erro ao adicionar funcionário');
            return false;
        }

        const newEmployee = await response.json();
        setEmployees(prev => [...prev, newEmployee]);
        toast.success('Funcionário adicionado com sucesso!');
        return true;
    } catch (error) {
        toast.error('Falha ao conectar com o servidor.');
        return false;
    }
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