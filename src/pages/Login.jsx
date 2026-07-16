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

      // Save authentication data
      loginUser(response.token, response.role);

      console.log("Login Successful");

      // Redirect based on role
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            CreatorFlow
          </h1>
          <p className="text-slate-400 text-sm">Manage your creative projects</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to continue managing your projects.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 h-10"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex flex-col space-y-4 border-t border-slate-700 pt-6">
            <p className="text-slate-400 text-sm text-center w-full">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Footer Text */}
        <p className="text-center text-slate-500 text-xs mt-8">
          © {new Date().getFullYear()} CreatorFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
