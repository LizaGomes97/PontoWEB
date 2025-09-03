import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { useSettings, Theme, FontSize, ContrastMode, MotionPreference } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Palette, 
  Type, 
  Eye, 
  Zap,
  Bell,
  User,
  Shield,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { user, logout } = useAuth();
  const {
    theme,
    fontSize,
    contrastMode,
    motionPreference,
    notificationsEnabled,
    setTheme,
    setFontSize,
    setContrastMode,
    setMotionPreference,
    setNotificationsEnabled,
    resetSettings
  } = useSettings();

  const handleResetSettings = () => {
    resetSettings();
    toast.success('Configurações restauradas para o padrão');
  };

  const handleLogout = () => {
    logout();
    toast.success('Deslogado com sucesso');
  };

  const themeOptions = [
    { value: 'light' as Theme, label: 'Claro', description: 'Tema claro para uso durante o dia' },
    { value: 'dark' as Theme, label: 'Escuro', description: 'Tema escuro para reduzir cansaço visual' },
    { value: 'system' as Theme, label: 'Sistema', description: 'Segue a preferência do sistema' }
  ];

  const fontSizeOptions = [
    { value: 'small' as FontSize, label: 'Pequeno', description: '14px - Mais conteúdo na tela' },
    { value: 'medium' as FontSize, label: 'Médio', description: '16px - Tamanho padrão recomendado' },
    { value: 'large' as FontSize, label: 'Grande', description: '18px - Melhor legibilidade' }
  ];

  const contrastOptions = [
    { value: 'normal' as ContrastMode, label: 'Normal', description: 'Contraste padrão' },
    { value: 'high' as ContrastMode, label: 'Alto', description: 'Maior contraste para melhor visibilidade' }
  ];

  const motionOptions = [
    { value: 'normal' as MotionPreference, label: 'Normal', description: 'Animações e transições completas' },
    { value: 'reduced' as MotionPreference, label: 'Reduzido', description: 'Reduz animações e movimento' }
  ];

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
              <h1 className="text-lg font-medium">Configurações</h1>
              <p className="text-sm text-muted-foreground">
                Personalize sua experiência no aplicativo
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Informações da Conta</CardTitle>
            </div>
            <CardDescription>
              Dados do usuário logado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <p className="text-sm bg-muted p-3 rounded-md">{user?.name}</p>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <p className="text-sm bg-muted p-3 rounded-md">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Usuário</Label>
              <p className="text-sm bg-muted p-3 rounded-md">
                {user?.type === 'employee' ? 'Funcionário' : 'Gestor'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Aparência</CardTitle>
            </div>
            <CardDescription>
              Personalize o visual do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="theme-select">Tema</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme-select">
                  <SelectValue placeholder="Selecionar tema" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="contrast-select">Contraste</Label>
              <Select value={contrastMode} onValueChange={setContrastMode}>
                <SelectTrigger id="contrast-select">
                  <SelectValue placeholder="Selecionar contraste" />
                </SelectTrigger>
                <SelectContent>
                  {contrastOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <CardTitle>Acessibilidade</CardTitle>
            </div>
            <CardDescription>
              Opções para melhorar a experiência de uso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="font-size-select">Tamanho da Fonte</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger id="font-size-select">
                  <SelectValue placeholder="Selecionar tamanho" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="motion-select">Movimento e Animações</Label>
              <Select value={motionPreference} onValueChange={setMotionPreference}>
                <SelectTrigger id="motion-select">
                  <SelectValue placeholder="Selecionar preferência" />
                </SelectTrigger>
                <SelectContent>
                  {motionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>
              Gerencie como você recebe notificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="notifications-toggle">Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes de registro de ponto e atualizações importantes
                </p>
              </div>
              <Switch
                id="notifications-toggle"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                aria-describedby="notifications-description"
              />
            </div>
            <p id="notifications-description" className="sr-only">
              Ativar ou desativar notificações push do aplicativo
            </p>
          </CardContent>
        </Card>

        {/* Privacy and Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Privacidade e Segurança</CardTitle>
            </div>
            <CardDescription>
              Informações sobre como seus dados são protegidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Dados de Localização</h4>
              <p className="text-sm text-muted-foreground">
                Sua localização é usada apenas para verificar o local de registro do ponto. 
                Os dados não são compartilhados com terceiros.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Armazenamento Local</h4>
              <p className="text-sm text-muted-foreground">
                Suas configurações são salvas localmente no seu dispositivo. 
                Os dados de ponto são armazenados de forma segura.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help and Support */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <CardTitle>Ajuda e Suporte</CardTitle>
            </div>
            <CardDescription>
              Precisa de ajuda? Encontre informações úteis aqui
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Como registrar ponto?</h4>
              <p className="text-sm text-muted-foreground">
                Use os botões "Entrada" e "Saída" na tela principal. 
                Certifique-se de que sua localização está ativada.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Problemas com GPS?</h4>
              <p className="text-sm text-muted-foreground">
                Verifique se as permissões de localização estão ativadas para o navegador. 
                Em caso de erro, o sistema usará uma localização padrão.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Button
                variant="outline"
                onClick={handleResetSettings}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Configurações Padrão
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full"
              >
                Sair da Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}