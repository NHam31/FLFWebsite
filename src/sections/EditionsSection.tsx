import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditionsSection() {
  const navigate = useNavigate();
  const { data: editions, isLoading } = trpc.editions.list.useQuery();

  return (
    <section id="editions" className="py-20 bg-[#F8FAF9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 bg-[#4A9B8E]/10 text-[#4A9B8E] rounded-full text-sm font-medium mb-4">
            الدورات السابقة
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">الدورات السابقة للأكاديمية</h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            استعرض دورات أكاديمية أطر الغد منذ البداية، واكتشف المحاضرات والمؤطرين والصور
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {editions?.map((edition, index) => (
              <motion.button
                key={edition.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => navigate(`/edition/${edition.editionNumber}`)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#4A9B8E]/30 transition-all card-hover text-right"
              >
                <div className="h-32 bg-gradient-to-br from-[#4A9B8E] to-[#6BC4B2] flex items-center justify-center">
                  {edition.coverImage ? (
                    <img
                      src={edition.coverImage}
                      alt={edition.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-white/50" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 text-xs text-[#4A9B8E] mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>{edition.dateRange || "غير محدد"}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#4A9B8E] transition-colors">
                    {edition.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{edition.description}</p>
                  <div className="mt-3 flex items-center text-xs text-[#4A9B8E] font-medium">
                    <span>عرض التفاصيل</span>
                    <ArrowLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
