import { Link } from "react-router";
import { motion } from "framer-motion";
import { ChevronDown, Users, Target, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-primary">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#6BC4B2] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/images/logo.png"
            alt="مؤسسة أطر الغد"
            className="h-24 md:h-32 w-auto mx-auto mb-6 drop-shadow-lg"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold text-white mb-4 text-shadow"
        >
          مؤسسة أطر الغد
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          مؤسسة مغربية تُوجّه أنشطتها إلى طلبة وخريجي المعاهد العليا،
          بهدف تأهيل شباب مغربي معتز بهويته، حامل لقيم الصدق والأمانة،
          وقوي في تخصصه العلمي
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/signup">
            <Button size="lg" className="bg-white text-[#4A9B8E] hover:bg-white/90 font-semibold px-8">
              <Users className="w-5 h-5 mr-2" />
              انضم إلينا
            </Button>
          </Link>
          <button
            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border-2 border-white/50 text-white hover:bg-white/10 transition-colors font-semibold"
          >
            <BookOpen className="w-5 h-5" />
            تعرف علينا
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-16 flex justify-center gap-8 md:gap-16"
        >
          {[
            { icon: Users, label: "أكثر من 2000 سفير", value: "2K+" },
            { icon: Award, label: "دورة أكاديمية", value: "18" },
            { icon: Target, label: "مؤسسة جامعية", value: "40+" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="w-6 h-6 text-white/70 mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs md:text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <button
          onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
          className="animate-bounce text-white/70 hover:text-white transition-colors"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </motion.div>
    </section>
  );
}
