import { Variants } from "framer-motion"

export const fadeIn = (duration = 0.5, delay = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration, delay, ease: "easeOut" }
  }
})

export const fadeUp = (yOffset = 20, duration = 0.6, delay = 0): Variants => ({
  hidden: { opacity: 0, y: yOffset },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } // Custom modern easeOutExpo
  }
})

export const slideLeft = (xOffset = 50, duration = 0.5, delay = 0): Variants => ({
  hidden: { opacity: 0, x: xOffset },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration, delay, ease: "easeOut" }
  }
})

export const slideRight = (xOffset = 50, duration = 0.5, delay = 0): Variants => ({
  hidden: { opacity: 0, x: -xOffset },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration, delay, ease: "easeOut" }
  }
})

export const scaleIn = (duration = 0.4, delay = 0): Variants => ({
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] }
  }
})

export const staggerChildren = (staggerBy = 0.1, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerBy,
      delayChildren: delayChildren,
    }
  }
})

export const floating = (yRange = 8, duration = 3): Variants => ({
  animate: {
    y: [0, -yRange, 0],
    transition: {
      duration: duration,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
})

export const hoverLift = {
  hover: {
    y: -4,
    boxShadow: "0 10px 30px -10px rgba(139, 92, 246, 0.2)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

export const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(139, 92, 246, 0)",
      "0 0 15px 2px rgba(139, 92, 246, 0.3)",
      "0 0 0 0 rgba(139, 92, 246, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}
