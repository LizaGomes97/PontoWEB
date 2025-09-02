import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Download,
  MapPin,
  TrendingUp
} from 'lucide-react';

interface TimesheetViewProps {
  onBack: () => void;
}

export function TimesheetView({ onBack }: TimesheetViewProps) {
  const { user, timeEntries } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filter entries for selected month
  const monthEntries = useMemo(() => {
    if (!user) return [];
    
    const [year, month] = selectedMonth.split('-');
    return timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entry.employeeId === user.id &&
               entryDate.getFullYear() === parseInt(year) &&
               entryDate.getMonth() === parseInt(month) - 1;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timeEntries, user, selectedMonth]);

  // Calculate statistics for the month
  const monthStats = useMemo(() => {
    const totalHours = monthEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const workedDays = monthEntries.filter(entry => entry.checkIn && entry.checkOut).length;
    const partialDays = monthEntries.filter(entry => entry.checkIn && !entry.checkOut).length;
    const averageHours = workedDays > 0 ? totalHours / workedDays : 0;
    
    return {
      totalHours: totalHours.toFixed(1),
      workedDays,
      partialDays,
      averageHours: averageHours.toFixed(1),
      totalEntries: monthEntries.length
    };
  }, [monthEntries]);

  // Generate month options for the last 12 months
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      });
      options.push({ value, label });
    }
    
    return options;
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const formatTime = (timeString: string) => {
    return timeString || '--:--';
  };

  const getEntryStatus = (entry: any) => {
    if (entry.checkIn && entry.checkOut) return 'complete';
    if (entry.checkIn && !entry.checkOut) return 'partial';
    return 'absent';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="default" className="bg-green-500">Completo</Badge>;
      case 'partial':
        return <Badge variant="secondary">Parcial</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-medium">Folha de Ponto</h1>
              <p className="text-sm text-muted-foreground">
                Histórico detalhado de registros
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Month Selector and Export */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Month Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Horas</p>
                  <p className="text-xl font-medium">{monthStats.totalHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Dias Trabalhados</p>
                  <p className="text-xl font-medium">{monthStats.workedDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Média Diária</p>
                  <p className="text-xl font-medium">{monthStats.averageHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Registros</p>
                  <p className="text-xl font-medium">{monthStats.totalEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timesheet Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Registros do Mês</CardTitle>
            <CardDescription>
              Histórico detalhado de entradas e saídas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthEntries.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum registro encontrado para o mês selecionado
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {monthEntries.map((entry, index) => {
                  const status = getEntryStatus(entry);
                  
                  return (
                    <div key={entry.id}>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col items-center">
                            <div className="text-sm font-medium">
                              {formatDate(entry.date)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString('pt-BR', { 
                                day: '2-digit'
                              })}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Entrada: </span>
                                <span className="font-medium">{formatTime(entry.checkIn)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Saída: </span>
                                <span className="font-medium">{formatTime(entry.checkOut)}</span>
                              </div>
                            </div>
                            
                            {entry.location && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {entry.location.address}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          {getStatusBadge(status)}
                          <div className="text-sm font-medium">
                            {entry.totalHours ? `${entry.totalHours.toFixed(1)}h` : '--'}
                          </div>
                        </div>
                      </div>
                      
                      {index < monthEntries.length - 1 && <Separator className="my-4" />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {monthEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Frequência</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dias completos:</span>
                      <span>{monthStats.workedDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dias parciais:</span>
                      <span>{monthStats.partialDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de registros:</span>
                      <span>{monthStats.totalEntries}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Horas Trabalhadas</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{monthStats.totalHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Média diária:</span>
                      <span>{monthStats.averageHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Média semanal:</span>
                      <span>{(parseFloat(monthStats.averageHours) * 5).toFixed(1)}h</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Informações</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Período:</span>
                      <span>{monthOptions.find(opt => opt.value === selectedMonth)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Funcionário:</span>
                      <span>{user?.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}