"use client";

import React, {
  useState,
  useRef,
  useContext,
  createContext,
  useEffect,
} from "react";
// Import useSearchParams along with the other hooks
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import styles from "./Loader.module.css";

const TransitionContext = createContext({
  navigate: (href: string) => {},
});

export const useTransitionRouter = () => useContext(TransitionContext);

export default function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Get the current URL search params
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // This hook now correctly listens for changes to the full URL (path + params)
  useEffect(() => {
    if (isTransitioning) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(overlayRef.current, { display: "none" });
          setIsTransitioning(false);
        },
      });
    }
  }, [pathname, searchParams]); // THE FIX: Add searchParams to the dependency array

  const navigate = (href: string) => {
    const currentUrl = pathname + searchParams.toString();
    if (currentUrl === href || isTransitioning) return;

    setIsTransitioning(true);

    gsap.fromTo(
      overlayRef.current,
      {
        display: "grid",
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          router.push(href);
        },
      }
    );
  };

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}

      <div
        ref={overlayRef}
        className="fixed top-0 left-0 w-screen h-screen bg-black/90 z-50 pointer-events-none hidden place-content-center"
      >
        <div className={styles.loader}>
          <div className={`${styles.inner} ${styles.one}`}></div>
          <div className={`${styles.inner} ${styles.two}`}></div>
          <div className={`${styles.inner} ${styles.three}`}></div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
