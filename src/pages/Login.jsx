import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login: loginUser } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);

      const response = await login({
        email,
        password,
      });

      loginUser(response.token, response.role);

      if (response.role === "CREATOR") {
        navigate("/creator/dashboard");
      } else {
        navigate("/editor/dashboard");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,153,170,0.22),_transparent_30%),linear-gradient(135deg,_#fffaf7_0%,_#f4efe9_50%,_#f1e7df_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#ff5a64] to-[#d50a2f] ring-4 ring-[#ffe5ea] shadow-lg shadow-[#f6d3d8]">
              <img src="/creatorflow-logo.svg" alt="CreatorFlow" className="h-10 w-10 object-cover" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">CreatorFlow</h1>
          <p className="text-sm text-slate-600">Create, review, and publish with clarity.</p>
        </div>

        <Card className="border-[#f2e2dd] bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(148,108,92,0.12)] ring-1 ring-[#f6e4dc]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Welcome back</CardTitle>
            <CardDescription className="text-slate-600">Sign in to continue managing your projects.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-[#f0d8d0] bg-[#fffaf7] text-slate-900 placeholder:text-slate-400 focus:border-[#ff7d92] focus:ring-[#ffd6de]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#f0d8d0] bg-[#fffaf7] text-slate-900 placeholder:text-slate-400 focus:border-[#ff7d92] focus:ring-[#ffd6de]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-gradient-to-r from-[#ff5a64] to-[#d50a2f] text-white shadow-md shadow-[#f2c3cb] hover:brightness-105"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t border-[#f4e7e2] pt-6">
            <p className="w-full text-center text-sm text-slate-600">
              Don’t have an account?{" "}
              <Link to="/register" className="font-semibold text-[#c81e3f] transition-colors hover:text-[#a31833]">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-xs text-slate-500">© {new Date().getFullYear()} CreatorFlow. All rights reserved.</p>
      </div>
    </div>
  );
}
