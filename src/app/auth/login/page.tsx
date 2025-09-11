"use client";

import { login } from "@/lib/auth-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { GradientBackground } from "@/components/gradient-background";

export default function LoginClient() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null | undefined>(null);
  async function handleSubmit() {
    setErrorMsg(null);
    setLoading(true);
    if (!email.trim() || !password.trim()) return;

    const { error } = await login(email, password);
    setLoading(false);
    if (error) {
      console.error(error);
      return setErrorMsg(error);
    } else {
      router.replace("/");
    }
  }

  return (
    <div className="flex items-center justify-center h-[100dvh] ">
      <GradientBackground />
      <Card className="p-6 w-[375px] z-10">
        <Image
          src="https://framerusercontent.com/images/wA1VuWB2hJTmPECUOk81HM535U.svg"
          alt="Logo"
          height={24}
          width={24}
          className="mx-auto"
        />
        <h1 className="font-semibold text-xl text-center">Logga in</h1>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="email" className="text-xs">
            Email
          </Label>
          <Input
            value={email}
            placeholder="Email"
            type="email"
            name="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative flex flex-col space-y-2">
          <Label htmlFor="password" className="text-xs">
            Lösenord
          </Label>
          <Input
            value={password}
            type={showPassword ? "text" : "password"}
            placeholder="Lösenord"
            name="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-[8] h-full px-2 hover:bg-transparent 
                                       transition-colors duration-200 ease-in-out"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-3.5 w-3.5 text-gray-400 transition-colors duration-200 hover:text-gray-600" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-gray-400 transition-colors duration-200 hover:text-gray-600" />
            )}
          </Button>
        </div>

        {errorMsg && (
          <p className="text-sm text-center text-destructive">{errorMsg}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading || !password.trim() || !email.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loggar in...
            </>
          ) : (
            "Logga in"
          )}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Kontakta din administratör för ett konto.
        </p>
      </Card>
    </div>
  );
}
