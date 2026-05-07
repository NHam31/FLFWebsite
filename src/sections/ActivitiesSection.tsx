import { motion } from "framer-motion";
import { School, Users2, Crown, Truck, Briefcase } from "lucide-react";

const activities = [
  {
    icon: School,
    title: "أكاديمية أطر الغد",
    description:
      "مبادرة تهدف إلى كسر الجمود الأكاديمي لدى طلبة المعاهد العليا، من خلال توسيع آفاقهم وتعزيز انخراطهم في قضايا الوطن والأمة. تتضمن ندوات فكرية وثقافية وسياسية، ومحاضرات، ومسابقات مهارية وإبداعية.",
    color: "#4A9B8E",
  },
  {
    icon: Users2,
    title: "ملتقى السفراء",
    description:
      "ملتقى تفاعلي يجمع سفراء الأكاديمية بهدف توحيد الرؤية وتعزيز الانتماء المؤسسي، وإتاحة الفرصة لتبادل التجارب والخبرات وتحفيز روح المبادرة والابتكار.",
    color: "#5FB3A3",
  },
  {
    icon: Crown,
    title: "برنامج أمناء",
    description:
      "برنامج تأهيلي قيادي مستمر موجه إلى خريجي أكاديمية أطر الغد (السفراء)، يمتد على مدار السنة، ويهدف إلى بناء نموذج قيادي متكامل يجمع بين الرسوخ الفكري والترابوي، والنضج العملي.",
    color: "#3D7A6F",
  },
  {
    icon: Truck,
    title: "قافلة الكرامة",
    description:
      "قافلة من دورات أربع نظمتها مؤسسة أطر الغد، وهي مبادرة إنسانية جابت مختلف الدواوير والمناطق القروية، إطار سعيها إلى ترسيخ قيم التضامن والتكافل الاجتماعي.",
    color: "#6BC4B2",
  },
  {
    icon: Briefcase,
    title: "قافلة المهن",
    description:
      "قافلة توجيه ميدانية يشرف عليها سفراء الأكاديمية من الطلبة والخريجين، بهدف نقل التوجيه إلى المؤسسات البعيدة عن الكبرى المدن وجعل المعلومة متاحة لجميع التلاميذ.",
    color: "#2D5F56",
  },
];

export default function ActivitiesSection() {
  return (
    <section id="activities" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 bg-[#4A9B8E]/10 text-[#4A9B8E] rounded-full text-sm font-medium mb-4">
            أنشطتنا
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">أنشطة المؤسسة</h2>
        </motion.div>

        <div className="space-y-6">
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col md:flex-row gap-6 bg-[#F8FAF9] rounded-2xl p-6 border border-gray-100 hover:border-[#4A9B8E]/20 transition-colors"
            >
              <div
                className="p-4 rounded-xl h-fit w-fit"
                style={{ backgroundColor: `${activity.color}15` }}
              >
                <activity.icon className="w-8 h-8" style={{ color: activity.color }} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{activity.title}</h3>
                <p className="text-gray-600 leading-relaxed">{activity.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
