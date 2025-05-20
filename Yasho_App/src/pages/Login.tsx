import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { toast } from "react-toastify";
import { FaLock, FaMobileAlt, FaUserMd } from "react-icons/fa";
import auth from "../api/user/auth";

const Login = ({ setIsAuthenticated, loading, setLoading, setUser }) => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await auth.login(mobile, password);
      if (response && response.status_code !== 0) {
        toast.error(response.error);
        return;
      }
      if (response?.status_code === 0 && response.data.token) {
        const userResponse = await auth.getMe();        
        if (userResponse?.data?.profile?.entity_type) {
          setUser(userResponse);
          setIsAuthenticated(true);

          toast.success("Login successful");
          switch (userResponse?.data?.profile?.entity_type) {
            case "admin":
              navigate("/admin");
              break;
            case "client":
              navigate("/client");
              break;
            case "pract":
              navigate("/pract");
              break;
            default:
              navigate("/");
          }
        } else {
          toast.error("Failed to get user info");
        }
      } else {
        toast.error(response.data.error.message);
      }
    } catch (err) {
      console.error("err", err);
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-healthcare-primary/10 p-6">
              <FaUserMd className="h-12 w-12 text-healthcare-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Yashocare Visit App</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your details to sign in
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Mobile</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMobileAlt className="text-gray-400" />
                </div>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </Button>
          </form>
        </CardContent>
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?
            <Link
              to="/register"
              className="text-healthcare-primary hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
