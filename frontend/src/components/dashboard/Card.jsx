import { motion } from "motion/react";

function Card({ title, className = "", delay = 0, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-xl border border-border-subtle bg-bg-card p-4 sm:p-5 ${className}`}
    >
      {title && (
        <h3 className="mb-4 text-sm font-medium text-text-main">{title}</h3>
      )}
      {children}
    </motion.section>
  );
}

export default Card;
