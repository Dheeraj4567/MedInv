"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"; 
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful
      toast({ title: "Login Successful", description: `Welcome back, ${data.user?.name || data.user?.username || 'Administrator'}!` });
      console.log('Login successful:', data.user);

      // Redirect to the main dashboard after successful login
      router.push('/'); 

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed", 
        description: err.message || "Please check your credentials and try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left side - Medical themed gradient background with logo */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-blue-400 to-cyan-300 flex-col justify-center items-center p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10 bg-repeat-space"></div>
        <div className="z-10 text-center">
          <Image 
            src="/image.png" // Updated path to the logo in the public directory
            alt="MedInv Logo" // Changed from MediTrack to MedInv
            width={180} 
            height={180} 
            className="mx-auto mb-8"
          />
          <h1 className="text-4xl font-extrabold text-white mb-6">MedInv</h1> // Changed from MediTrack to MedInv
          <p className="text-xl text-white/90 max-w-md mx-auto">
            Comprehensive medical inventory management system for modern healthcare facilities
          </p>
        </div>
      </motion.div>

      {/* Right side - Login Form */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-6 bg-background"
      >
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-center">
              Administrator Login
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground text-base">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-6">
              <motion.div 
                className="grid gap-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="username" className="text-base">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  className="h-12"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </motion.div>
              <motion.div 
                className="grid gap-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="password" className="text-base">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="h-12 pr-10"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? 
                      <EyeOffIcon className="h-5 w-5" /> : 
                      <EyeIcon className="h-5 w-5" />
                    }
                  </button>
                </div>
              </motion.div>
              
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-800"
                >
                  {error}
                </motion.p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Secure access for authorized personnel only
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
