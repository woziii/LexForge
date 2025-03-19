// Importer depuis notre nouveau fichier utils.js local
import { cn } from "./utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  tabletClassName,
}) => {
  const [deviceType, setDeviceType] = useState(getDeviceType());

  // Détection du type d'appareil
  function getDeviceType() {
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Mise à jour du type d'appareil lors du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (deviceType === 'mobile') {
    return <FloatingDockMobile items={items} className={mobileClassName} />;
  } else if (deviceType === 'tablet') {
    return <FloatingDockTablet items={items} className={tabletClassName || desktopClassName} />;
  } else {
    return <FloatingDockDesktop items={items} className={desktopClassName} />;
  }
};

// Version mobile optimisée (verticale)
const FloatingDockMobile = ({
  items,
  className,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("fixed right-4 bottom-16 z-50", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="mobile-nav"
            className="absolute bottom-full mb-3 right-0 flex flex-col gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.03,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                {item.onClick ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      item.onClick();
                      // Ne pas fermer après l'action
                    }}
                    className="h-10 w-10 rounded-full bg-white dark:bg-neutral-900 shadow-md flex items-center justify-center"
                    title={item.title}
                  >
                    <div className="h-5 w-5">{item.icon}</div>
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    key={item.title}
                    className="h-10 w-10 rounded-full bg-white dark:bg-neutral-900 shadow-md flex items-center justify-center"
                    title={item.title}
                  >
                    <div className="h-5 w-5">{item.icon}</div>
                  </Link>
                )}
              </motion.div>
            ))}
            
            {/* Bouton explicite de fermeture */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: items.length * 0.05 }}
              className="mt-1"
            >
              <button
                onClick={() => setOpen(false)}
                className="h-10 w-10 rounded-full bg-white dark:bg-neutral-900 shadow-md flex items-center justify-center"
                title="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center border border-gray-200 dark:border-neutral-700"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
};

// Version tablette optimisée (hybride entre mobile et desktop)
const FloatingDockTablet = ({
  items,
  className,
}) => {
  const [open, setOpen] = useState(false);
  let mouseX = useMotionValue(Infinity);

  return (
    <div className={cn("fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50", className)}>
      {open ? (
        <motion.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className={cn(
            "mx-auto flex h-20 gap-4 items-end rounded-3xl bg-white dark:bg-neutral-900 px-5 pb-3 pt-2 shadow-xl border border-gray-200/50 dark:border-neutral-700/50"
          )}
        >
          {items.map((item) => (
            <TabletIconContainer mouseX={mouseX} key={item.title} {...item} onClose={() => setOpen(false)} />
          ))}
          <button
            onClick={() => setOpen(false)}
            className="absolute -right-3 -top-3 bg-white dark:bg-neutral-800 shadow-md rounded-full w-8 h-8 flex items-center justify-center border border-gray-200/50 dark:border-neutral-700/50 text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </motion.div>
      ) : (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="h-16 w-16 rounded-full bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center border border-gray-200/50 dark:border-neutral-700/50"
        >
          <IconLayoutNavbarCollapse className="h-7 w-7 text-neutral-500 dark:text-neutral-400" />
        </motion.button>
      )}
    </div>
  );
};

// Conteneur d'icônes pour la tablette
function TabletIconContainer({
  title,
  icon,
  href,
  onClick,
  onClose,
  mouseX
}) {
  let ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let width = useSpring(useTransform(distance, [-150, 0, 150], [56, 70, 56]), {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const Container = onClick ? 'button' : Link;
  const containerProps = onClick 
    ? { 
        onClick: (e) => {
          e.preventDefault();
          onClick();
          onClose?.();
        } 
      } 
    : { to: href };

  return (
    <Container {...containerProps}>
      <motion.div
        ref={ref}
        style={{ width }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(true)}
        onTouchEnd={() => setHovered(false)}
        className="aspect-square rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center relative hover:bg-blue-50 dark:hover:bg-blue-800/30 transition-colors"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-1 whitespace-pre rounded-md bg-white border dark:bg-neutral-800 dark:border-neutral-700 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs shadow-md"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-8 w-8 flex items-center justify-center">
          {icon}
        </div>
      </motion.div>
    </Container>
  );
}

const FloatingDockDesktop = ({
  items,
  className,
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden md:flex h-16 gap-4 items-end rounded-2xl bg-white dark:bg-neutral-900 px-4 pb-3",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
}) {
  let ref = useRef(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  const Container = onClick ? 'button' : Link;
  const containerProps = onClick 
    ? { 
        onClick: (e) => {
          e.preventDefault();
          onClick();
        } 
      } 
    : { to: href };

  return (
    <Container
      {...containerProps}
    >
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center relative hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-0.5 whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs shadow-md"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Container>
  );
} 