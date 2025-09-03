import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Timer,
  FileText,
  LogOut,
  Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeDashboardProps {
  onNavigate: (page: 'settings' | 'timesheet') => void;
  onLogout: () => void;
}

export function EmployeeDashboard({ onNavigate, onLogout }: EmployeeDashboardProps) {
  const { user, timeEntries, checkIn, checkOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get current location
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: 'Localização Atual'
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            // Fallback to mock location
            setLocation({
              latitude: -23.5505,
              longitude: -46.6333,
              address: 'São Paulo, SP'
            });
            toast.error('Não foi possível obter a localização. Usando localização padrão.');
          }
        );
      } else {
        setLocation({
          latitude: -23.5505,
          longitude: -46.6333,
          address: 'São Paulo, SP'
        });
        toast.error('Geolocalização não suportada pelo navegador.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = timeEntries.find(
    entry => entry.employeeId === user?.id && entry.date === today
  );

  const userTimeEntries = timeEntries
    .filter(entry => entry.employeeId === user?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7); // Last 7 days

  const handleCheckIn = async () => {
    if (!location) {
      toast.error('Localização não disponível');
      return;
    }

    setIsCheckingIn(true);
    try {
      await checkIn(location);
      toast.success('Entrada registrada com sucesso!');
    } catch (error) {
      toast.error('Erro ao registrar entrada');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location) {
      toast.error('Localização não disponível');
      return;
    }

    setIsCheckingIn(true);
    try {
      await checkOut(location);
      toast.success('Saída registrada com sucesso!');
    } catch (error) {
      toast.error('Erro ao registrar saída');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getWorkStatus = () => {
    if (!todayEntry) return 'not-started';
    if (todayEntry.checkIn && !todayEntry.checkOut) return 'working';
    if (todayEntry.checkIn && todayEntry.checkOut) return 'finished';
    return 'not-started';
  };

  const workStatus = getWorkStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium">Olá, {user?.name}</h1>
              <p className="text-sm text-muted-foreground">
                {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
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

      <div className="p-4 space-y-6">
        {/* Current Time */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-mono mb-2">
                {currentTime.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {location?.address || 'Obtendo localização...'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status and Check In/Out */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                {workStatus === 'not-started' && (
                  <Badge variant="secondary" className="text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    Não iniciado
                  </Badge>
                )}
                {workStatus === 'working' && (
                  <Badge variant="default" className="text-sm bg-green-500">
                    <Timer className="h-4 w-4 mr-1" />
                    Trabalhando
                  </Badge>
                )}
                {workStatus === 'finished' && (
                  <Badge variant="outline" className="text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Finalizado
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleCheckIn}
                  disabled={isCheckingIn || !location || (todayEntry?.checkIn && !todayEntry?.checkOut)}
                  className="h-12"
                  size="lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isCheckingIn ? 'Registrando...' : 'Entrada'}
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={isCheckingIn || !location || !todayEntry?.checkIn || todayEntry?.checkOut}
                  variant="outline"
                  className="h-12"
                  size="lg"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isCheckingIn ? 'Registrando...' : 'Saída'}
                </Button>
              </div>

              {todayEntry && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="text-muted-foreground">Entrada</div>
                      <div className="font-medium">{todayEntry.checkIn || '--:--'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Saída</div>
                      <div className="font-medium">{todayEntry.checkOut || '--:--'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Horas</div>
                      <div className="font-medium">{todayEntry.totalHours?.toFixed(1) || '--'}h</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Histórico Recente</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('timesheet')}
              >
                <FileText className="h-4 w-4 mr-1" />
                Ver tudo
              </Button>
            </div>
            <CardDescription>
              Últimos 7 dias de registro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userTimeEntries.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum registro encontrado
                </p>
              ) : (
                userTimeEntries.map((entry, index) => (
                  <div key={entry.id}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm">
                          <div className="font-medium">{formatDate(entry.date)}</div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">
                            {formatTime(entry.checkIn || '--:--')} - {formatTime(entry.checkOut || '--:--')}
                          </span>
                          <Badge variant={entry.totalHours ? 'default' : 'secondary'} className="text-xs">
                            {entry.totalHours?.toFixed(1) || '--'}h
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {index < userTimeEntries.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}