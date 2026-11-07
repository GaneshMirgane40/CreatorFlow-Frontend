import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/workflow";

const fieldClass =
  "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CREATOR" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login: loginUser } = useAuth();

  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setError("Enter your name, email and a password of at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const response = await register({ ...form, name: form.name.trim(), email: form.email.trim() });
      loginUser(response.token, response.role);
      navigate(response.role === "CREATOR" ? "/creator/dashboard" : "/editor/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl">CreatorFlow</h1>
          <p className="text-sm text-slate-400">Manage your creative projects</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Create an account</CardTitle>
            <CardDescription className="text-slate-400">Join as a creator or as an editor.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Name</Label>
                <Input id="name" value={form.name} onChange={update("name")} placeholder="Your name" className={fieldClass} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" className={fieldClass} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={update("password")} placeholder="••••••••" className={fieldClass} />
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-200">I am a</legend>
                <div className="grid grid-cols-2 gap-3">
                  {["CREATOR", "EDITOR"].map((role) => (
                    <label
                      key={role}
                      className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm ${
                        form.role === role
                          ? "border-blue-500 bg-blue-600/20 text-white"
                          : "border-slate-600 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      <input type="radio" name="role" value={role} checked={form.role === role} onChange={update("role")} className="sr-only" />
                      {role === "CREATOR" ? "Creator" : "Editor"}
                    </label>
                  ))}
                </div>
              </fieldset>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" disabled={loading} className="h-10 w-full bg-blue-600 font-medium text-white hover:bg-blue-700">
                {loading ? "Creating account..." : "Register"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-slate-700 pt-6">
            <p className="w-full text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
