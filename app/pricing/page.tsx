"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, TextPlugin, SplitText);

export default function PricingPage() {
  const router = useRouter();
  const mainRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      const title = new SplitText(titleRef.current, { type: "chars" });
      gsap.from(title.chars, {
        opacity: 0,
        y: 50,
        rotateX: -90,
        stagger: 0.02,
        duration: 0.8,
        ease: "back.out(1.7)",
      });

      // Subtitle animation
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.5,
      });

      // Pricing cards animation
      gsap.utils.toArray(".pricing-card").forEach((card: any, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=100",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 50,
          duration: 0.8,
          delay: i * 0.1,
        });
      });

      // Parallax effect
      gsap.to(".parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".pricing-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const handleSubscribe = (plan: string) => {
    router.push(`/checkout?plan=${plan}`);
  };

  return (
    <div ref={mainRef} className="min-h-screen bg-[#1A1A2E] pricing-section">
      <div className="absolute inset-0 parallax-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF3366]/10 to-[#1A1A2E]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FF3366] to-[#6C63FF]"
          >
            Choose Your Plan
          </h1>
          <p
            ref={subtitleRef}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Select the perfect plan for your AI persona needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="pricing-card bg-[#1A1A2E]/80 backdrop-blur-lg rounded-2xl p-8 border border-[#FF3366]/20 hover:border-[#FF3366]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF3366]/10">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-white mb-4">Free</h3>
              <div className="text-4xl font-bold text-white mb-6">
                $0<span className="text-lg text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  5 AI Personas
                </li>
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  100 Messages/Month
                </li>
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Basic Support
                </li>
              </ul>
              <button
                onClick={() => handleSubscribe("free")}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#6C63FF] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card bg-[#1A1A2E]/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-[#FF3366] hover:shadow-lg hover:shadow-[#FF3366]/20 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="inline-block px-4 py-1 rounded-full bg-[#FF3366]/10 text-[#FF3366] text-sm font-medium mb-4">
                Most Popular
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Pro</h3>
              <div className="text-4xl font-bold text-white mb-6">
                $19<span className="text-lg text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Unlimited AI Personas
                </li>
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  1000 Messages/Month
                </li>
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Priority Support
                </li>
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Advanced Analytics
                </li>
              </ul>
              <button
                onClick={() => handleSubscribe("pro")}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#6C63FF] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="pricing-card bg-[#1A1A2E]/80 backdrop-blur-lg rounded-2xl p-8 border border-[#FF3366]/20 hover:border-[#FF3366]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF3366]/10">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Enterprise
              </h3>
              <div className="text-4xl font-bold text-white mb-6">
                Custom<span className="text-lg text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Custom AI Personas
                </li>
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Unlimited Messages
                </li>
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  24/7 Dedicated Support
                </li>
                <li className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-[#FF3366] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Custom Integration
                  </li>
              </ul>
              <button
                onClick={() => handleSubscribe("enterprise")}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#6C63FF] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1A1A2E]/80 backdrop-blur-lg rounded-2xl p-6 border border-[#FF3366]/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                Can I switch plans later?
              </h3>
              <p className="text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="bg-[#1A1A2E]/80 backdrop-blur-lg rounded-2xl p-6 border border-[#FF3366]/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                What happens if I exceed my message limit?
              </h3>
              <p className="text-gray-300">
                You'll be notified when you're close to your limit. You can either
                upgrade your plan or wait for the next billing cycle.
              </p>
            </div>
            <div className="bg-[#1A1A2E]/80 backdrop-blur-lg rounded-2xl p-6 border border-[#FF3366]/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                Is there a free trial?
              </h3>
              <p className="text-gray-300">
                Yes, all paid plans come with a 14-day free trial. No credit card
                required.
              </p>
            </div>
            <div className="bg-[#1A1A2E]/80 backdrop-blur-lg rounded-2xl p-6 border border-[#FF3366]/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                How do I cancel my subscription?
              </h3>
              <p className="text-gray-300">
                You can cancel your subscription at any time from your account
                settings. You'll continue to have access until the end of your
                billing period.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#FF3366] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-[#6C63FF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-[#00F5FF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}
