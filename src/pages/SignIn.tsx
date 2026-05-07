import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const loginMutation = trpc.candidateAuth.login.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الدخول بنجاح!");
      setTimeout(() => navigate("/"), 1000);
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ أثناء تسجيل الدخول");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <Navbar />
      <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#4A9B8E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-[#4A9B8E]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">تسجيل الدخول</h1>
              <p className="text-gray-500 text-sm mt-2">أدخل بياناتك للوصول إلى حسابك</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                  className="text-right mt-1"
                />
              </div>

              <div className="relative">
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="******"
                  required
                  className="text-right mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-[34px] text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#4A9B8E] hover:bg-[#3D7A6F] text-white h-11"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  "جاري تسجيل الدخول..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              ليس لديك حساب؟{" "}
              <Link to="/signup" className="text-[#4A9B8E] hover:text-[#3D7A6F] font-medium">
                سجل الآن
              </Link>
            </p>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                بتسجيل الدخول، فإنك توافق على شروط الاستخدام وسياسة الخصوصية
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
