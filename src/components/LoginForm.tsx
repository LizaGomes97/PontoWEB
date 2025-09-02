import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useAuth, UserType } from '../contexts/AuthContext';
import { Clock, Users, UserCheck, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function LoginForm() {
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginUserType, setLoginUserType] = useState<UserType>('employee');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerUserType, setRegisterUserType] = useState<UserType>('employee');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginEmail, loginPassword, loginUserType);
      if (success) {
        toast.success('Login realizado com sucesso!');
      } else {
        toast.error('Credenciais inválidas');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== registerConfirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(registerName, registerEmail, registerPassword, registerUserType);
      if (success) {
        toast.success('Cadastro realizado com sucesso!');
      } else {
        toast.error('Erro ao criar conta');
      }
    } catch (error) {
      toast.error('Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Clock className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1>PontoFácil</h1>
          <p className="text-muted-foreground">
            Sistema de registro de ponto eletrônico
          </p>
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Fazer Login</CardTitle>
                <CardDescription>
                  Entre com suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                        aria-describedby="login-email-desc"
                      />
                    </div>
                    <p id="login-email-desc" className="text-sm text-muted-foreground sr-only">
                      Digite seu endereço de e-mail
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                        aria-describedby="login-password-desc"
                      />
                    </div>
                    <p id="login-password-desc" className="text-sm text-muted-foreground sr-only">
                      Digite sua senha
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Tipo de usuário</Label>
                    <RadioGroup
                      value={loginUserType}
                      onValueChange={(value) => setLoginUserType(value as UserType)}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employee" id="login-employee" />
                        <Label htmlFor="login-employee" className="flex items-center space-x-2 cursor-pointer">
                          <UserCheck className="h-4 w-4" />
                          <span>Funcionário</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employer" id="login-employer" />
                        <Label htmlFor="login-employer" className="flex items-center space-x-2 cursor-pointer">
                          <Users className="h-4 w-4" />
                          <span>Gestor</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Cadastre-se para começar a usar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="pl-10"
                        required
                        aria-describedby="register-name-desc"
                      />
                    </div>
                    <p id="register-name-desc" className="text-sm text-muted-foreground sr-only">
                      Digite seu nome completo
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10"
                        required
                        aria-describedby="register-email-desc"
                      />
                    </div>
                    <p id="register-email-desc" className="text-sm text-muted-foreground sr-only">
                      Digite seu endereço de e-mail
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                        aria-describedby="register-password-desc"
                      />
                    </div>
                    <p id="register-password-desc" className="text-sm text-muted-foreground">
                      Mínimo de 6 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        aria-describedby="register-confirm-password-desc"
                      />
                    </div>
                    <p id="register-confirm-password-desc" className="text-sm text-muted-foreground sr-only">
                      Digite novamente sua senha para confirmar
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Tipo de usuário</Label>
                    <RadioGroup
                      value={registerUserType}
                      onValueChange={(value) => setRegisterUserType(value as UserType)}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employee" id="register-employee" />
                        <Label htmlFor="register-employee" className="flex items-center space-x-2 cursor-pointer">
                          <UserCheck className="h-4 w-4" />
                          <span>Funcionário</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employer" id="register-employer" />
                        <Label htmlFor="register-employer" className="flex items-center space-x-2 cursor-pointer">
                          <Users className="h-4 w-4" />
                          <span>Gestor</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Sistema seguro e confiável para registro de ponto eletrônico
          </p>
        </div>
      </div>
    </div>
  );
}