import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp,
  Download,
  Filter,
  Search,
  LogOut,
  Settings as SettingsIcon,
  UserPlus,
  FileText
} from 'lucide-react';

interface EmployerDashboardProps {
  onNavigate: (page: 'settings') => void;
  onLogout: () => void;
}

export function EmployerDashboard({ onNavigate, onLogout }: EmployerDashboardProps) {
  const { user, employees, timeEntries } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('this-month');

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // Calculate date range for filtering
  const getDateRange = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'this-week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return { start: startOfWeek, end: endOfWeek };
      case 'this-month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start: startOfMonth, end: endOfMonth };
      case 'last-month':
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: startOfLastMonth, end: endOfLastMonth };
      default:
        return { start: new Date(0), end: new Date() };
    }
  };

  // Filter time entries
  const filteredTimeEntries = useMemo(() => {
    const { start, end } = getDateRange(dateFilter);
    
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const matchesDate = entryDate >= start && entryDate < end;
      const matchesEmployee = selectedEmployee === 'all' || entry.employeeId === selectedEmployee;
      return matchesDate && matchesEmployee;
    });
  }, [timeEntries, dateFilter, selectedEmployee]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalHours = filteredTimeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const workingDays = new Set(filteredTimeEntries.map(entry => entry.date)).size;
    const activeEmployees = new Set(filteredTimeEntries.map(entry => entry.employeeId)).size;
    
    return {
      totalEmployees: employees.length,
      activeEmployees,
      totalHours: totalHours.toFixed(1),
      workingDays,
      averageHoursPerDay: workingDays > 0 ? (totalHours / workingDays).toFixed(1) : '0'
    };
  }, [employees, filteredTimeEntries]);

  // Get employee status for today
  const getEmployeeStatus = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = timeEntries.find(
      entry => entry.employeeId === employeeId && entry.date === today
    );

    if (!todayEntry) return { status: 'absent', text: 'Ausente' };
    if (todayEntry.checkIn && !todayEntry.checkOut) return { status: 'working', text: 'Trabalhando' };
    if (todayEntry.checkIn && todayEntry.checkOut) return { status: 'finished', text: 'Finalizado' };
    return { status: 'absent', text: 'Ausente' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium">Dashboard Gerencial</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie funcionários e acompanhe relatórios
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('settings')}
                aria-label="Configurações"
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="employees">Funcionários</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Funcionários</p>
                      <p className="text-xl font-medium">{stats.totalEmployees}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ativos Hoje</p>
                      <p className="text-xl font-medium">{stats.activeEmployees}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Horas</p>
                      <p className="text-xl font-medium">{stats.totalHours}h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dias Úteis</p>
                      <p className="text-xl font-medium">{stats.workingDays}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade de Hoje</CardTitle>
                <CardDescription>
                  Status atual dos funcionários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees.map((employee, index) => {
                    const status = getEmployeeStatus(employee.id);
                    return (
                      <div key={employee.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(employee.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={
                              status.status === 'working' ? 'default' : 
                              status.status === 'finished' ? 'secondary' : 
                              'outline'
                            }
                            className={
                              status.status === 'working' ? 'bg-green-500' : ''
                            }
                          >
                            {status.text}
                          </Badge>
                        </div>
                        {index < employees.length - 1 && <Separator className="mt-3" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6 mt-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search-employees" className="sr-only">Buscar funcionários</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search-employees"
                        placeholder="Buscar funcionários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full md:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Funcionário
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Employees List */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Funcionários</CardTitle>
                <CardDescription>
                  Gerencie sua equipe e visualize informações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEmployees.map((employee, index) => {
                    const employeeEntries = timeEntries.filter(entry => entry.employeeId === employee.id);
                    const totalHours = employeeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
                    const status = getEmployeeStatus(employee.id);

                    return (
                      <div key={employee.id}>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(employee.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{employee.name}</h3>
                              <p className="text-sm text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={
                                status.status === 'working' ? 'default' : 
                                status.status === 'finished' ? 'secondary' : 
                                'outline'
                              }
                              className={`mb-1 ${status.status === 'working' ? 'bg-green-500' : ''}`}
                            >
                              {status.text}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {totalHours.toFixed(1)}h este mês
                            </p>
                          </div>
                        </div>
                        {index < filteredEmployees.length - 1 && <Separator className="my-4" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6 mt-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="employee-select">Funcionário</Label>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger id="employee-select">
                        <SelectValue placeholder="Selecionar funcionário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os funcionários</SelectItem>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date-filter">Período</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger id="date-filter">
                        <SelectValue placeholder="Selecionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="this-week">Esta semana</SelectItem>
                        <SelectItem value="this-month">Este mês</SelectItem>
                        <SelectItem value="last-month">Mês passado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Pontos</CardTitle>
                <CardDescription>
                  Registros de entrada e saída filtrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTimeEntries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum registro encontrado para os filtros selecionados
                    </p>
                  ) : (
                    filteredTimeEntries.map((entry, index) => {
                      const employee = employees.find(emp => emp.id === entry.employeeId);
                      return (
                        <div key={entry.id}>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {employee ? getInitials(employee.name) : '??'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{employee?.name || 'Funcionário'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(entry.date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Entrada: </span>
                                  <span className="font-medium">{entry.checkIn || '--:--'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Saída: </span>
                                  <span className="font-medium">{entry.checkOut || '--:--'}</span>
                                </div>
                                <Badge variant="secondary">
                                  {entry.totalHours?.toFixed(1) || '--'}h
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {index < filteredTimeEntries.length - 1 && <Separator className="my-4" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}