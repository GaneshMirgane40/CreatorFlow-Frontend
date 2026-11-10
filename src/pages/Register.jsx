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
  "border-[#f0d8d0] bg-[#fffaf7] text-slate-900 placeholder:text-slate-400 focus:border-[#ff7d92] focus:ring-[#ffd6de]";

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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,153,170,0.22),_transparent_30%),linear-gradient(135deg,_#fffaf7_0%,_#f4efe9_50%,_#f1e7df_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#ff5a64] to-[#d50a2f] ring-4 ring-[#ffe5ea] shadow-lg shadow-[#f6d3d8]">
              <img src="/creatorflow-logo.svg" alt="CreatorFlow" className="h-10 w-10 object-cover" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">CreatorFlow</h1>
          <p className="text-sm text-slate-600">Manage your creative projects with less friction.</p>
        </div>

        <Card className="border-[#f2e2dd] bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(148,108,92,0.12)] ring-1 ring-[#f6e4dc]">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Create an account</CardTitle>
            <CardDescription className="text-slate-600">Join as a creator or as an editor.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Name</Label>
                <Input id="name" value={form.name} onChange={update("name")} placeholder="Your name" className={fieldClass} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" className={fieldClass} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={update("password")} placeholder="••••••••" className={fieldClass} />
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700">I am a</legend>
                <div className="grid grid-cols-2 gap-3">
                  {["CREATOR", "EDITOR"].map((role) => (
                    <label
                      key={role}
                      className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition ${
                        form.role === role
                          ? "border-[#ff9aa7] bg-[#fff1ee] text-[#c81e3f]"
                          : "border-[#f1dde5] bg-[#fffaf7] text-slate-600 hover:border-[#f4c5ce]"
                      }`}
                    >
                      <input type="radio" name="role" value={role} checked={form.role === role} onChange={update("role")} className="sr-only" />
                      {role === "CREATOR" ? "Creator" : "Editor"}
                    </label>
                  ))}
                </div>
              </fieldset>

              {error && <p className="text-sm text-[#c81e3f]">{error}</p>}

              <Button type="submit" disabled={loading} className="h-11 w-full bg-gradient-to-r from-[#ff5a64] to-[#d50a2f] text-white shadow-md shadow-[#f2c3cb] hover:brightness-105">
                {loading ? "Creating account..." : "Register"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-[#f4e7e2] pt-6">
            <p className="w-full text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#c81e3f] transition-colors hover:text-[#a31833]">Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
