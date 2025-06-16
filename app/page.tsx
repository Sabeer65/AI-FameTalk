"use client";

import React, { useEffect, useRef } from "react";
// Import the new Button component from its location in the ui folder
import { Button } from "@/components/ui/button";
import TransitionLink from "@/components/TransitionLink";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger, TextPlugin, SplitText);

export default function HomePage() {
  const mainRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const heroRef = useRef(null);

  const celebrityCards = [
    {
      name: "Albert Einstein",
      image: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg",
      quote: "You can talk to me!",
    },
    {
      name: "Cleopatra",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Cleopatra-VII-Philopator.jpg",
      quote: "Let's chat about history!",
    },
    {
      name: "Nikola Tesla",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/79/Tesla_circa_1890.jpeg",
      quote: "Ask me anything about inventions!",
    },
    {
      name: "Sherlock Holmes",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Sherlock_Holmes_Portrait_Paget.jpg",
      quote: "Let's solve mysteries together!",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animations
      const tl = gsap.timeline();
      
      // Split and animate title
      const title = new SplitText(titleRef.current, { type: "chars,words" });
      tl.from(title.chars, {
        opacity: 0,
        y: 100,
        rotateX: -90,
        stagger: 0.02,
        duration: 0.8,
        ease: "back.out(1.7)",
      });

      // Animate subtitle
      tl.from(subtitleRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.4");

      // Animate CTA buttons
      tl.from(".cta-buttons", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.4");

      // Scroll animations
      gsap.utils.toArray(".scroll-section").forEach((section: any, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top center",
            toggleActions: "play none none reverse",
          },
          x: direction * 100,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
        });
      });

      // Parallax effect for hero background
      gsap.to(".parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Animated stats counter
      gsap.utils.toArray(".stat-number").forEach((stat: any) => {
        gsap.from(stat, {
          scrollTrigger: {
            trigger: stat,
            start: "top bottom",
            toggleActions: "play none none reverse",
          },
          textContent: 0,
          duration: 2,
          ease: "power1.out",
          snap: { textContent: 1 },
          stagger: 0.2,
        });
      });

      // Magnetic effect for buttons
      const buttons = document.querySelectorAll(".magnetic-button");
      buttons.forEach((button: any) => {
        button.addEventListener("mousemove", (e: MouseEvent) => {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          gsap.to(button, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        button.addEventListener("mouseleave", () => {
          gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });

      // SVG sparkle animation
      gsap.to(".sparkle", {
        scale: 1.3,
        opacity: 0.7,
        yoyo: true,
        repeat: -1,
        duration: 1.2,
        ease: "power1.inOut",
        stagger: 0.2,
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-[#000000]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden hero-section">
        <div className="absolute inset-0 parallax-bg">
          <div className="absolute inset-0 bg-gradient-to-b from-[#3E065F]/20 to-[#000000]"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        </div>
        <div className="container mx-auto px-4 py-24 text-center relative z-10 flex flex-col items-center">
          {/* Modern Hero Image */}
          <div className="mb-10 flex justify-center">
            <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80" alt="AI Chat" className="rounded-3xl shadow-2xl w-full max-w-xl object-cover animate-fade-in" style={{animation: 'fadeIn 1.2s ease'}} />
          </div>
          <h1
            ref={titleRef}
            className="text-6xl md:text-7xl font-extrabold leading-tight mb-8 bg-gradient-to-r from-[#FF3366] via-[#6C63FF] to-[#00F5FF] bg-clip-text text-transparent drop-shadow-lg"
          >
            Chat with History's Greatest Minds
          </h1>
          <p
            ref={subtitleRef}
            className="text-2xl md:text-3xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Step into a world where you can converse with the most influential figures in history.<br />
            Experience their wisdom, wit, and unique perspectives through our advanced AI technology.
          </p>
          <div className="cta-buttons flex justify-center items-center gap-8 mb-12">
            <TransitionLink href="/personas">
              <Button size="lg" className="magnetic-button text-xl bg-[#FF3366] hover:bg-[#6C63FF] px-10 py-8 rounded-full transform hover:scale-105 transition-all duration-300 shadow-xl">
                Start Your Journey
              </Button>
            </TransitionLink>
            <TransitionLink href="/personas">
              <Button size="lg" variant="secondary" className="magnetic-button text-xl border-2 border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF] hover:text-white px-10 py-8 rounded-full transform hover:scale-105 transition-all duration-300 shadow-xl">
                Explore Personas
              </Button>
            </TransitionLink>
          </div>
          {/* Celebrity Cards */}
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            {celebrityCards.map((celeb) => (
              <div key={celeb.name} className="bg-[#1A1A2E]/80 rounded-2xl shadow-xl p-6 flex flex-col items-center w-64 border border-[#6C63FF]/30 hover:scale-105 transition-transform duration-300">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-[#FF3366]/40">
                  <Image src={celeb.image} alt={celeb.name} width={96} height={96} className="w-24 h-24 object-cover rounded-full" />
                </div>
                <div className="font-bold text-lg mb-2 text-white">{celeb.name}</div>
                <div className="bg-gradient-to-r from-[#FF3366] to-[#6C63FF] text-white px-4 py-2 rounded-full text-center text-base font-semibold shadow-lg">
                  {celeb.quote}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#8E05C2] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-64 h-64 bg-[#700B97] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-[#3E065F] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-[#3E065F] text-white scroll-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold mb-4 stat-number">100+</div>
              <p className="text-2xl text-gray-300">Unique Personas</p>
            </div>
            <div className="p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold mb-4 stat-number">50K+</div>
              <p className="text-2xl text-gray-300">Active Users</p>
            </div>
            <div className="p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold mb-4 stat-number">1M+</div>
              <p className="text-2xl text-gray-300">Conversations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-[#000000] text-white scroll-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-[#8E05C2] to-[#700B97] bg-clip-text text-transparent">
            Experience the Future of AI Conversations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="feature-card p-10 rounded-3xl bg-[#3E065F] hover:bg-[#700B97] transition-all duration-300 transform hover:scale-105">
              <h3 className="text-3xl font-semibold mb-6">Realistic Conversations</h3>
              <p className="text-xl text-gray-300">Experience natural and engaging conversations with AI personas that feel authentic and human-like.</p>
            </div>
            <div className="feature-card p-10 rounded-3xl bg-[#3E065F] hover:bg-[#700B97] transition-all duration-300 transform hover:scale-105">
              <h3 className="text-3xl font-semibold mb-6">Diverse Characters</h3>
              <p className="text-xl text-gray-300">Choose from a wide range of historical figures, celebrities, and fictional characters from any era.</p>
            </div>
            <div className="feature-card p-10 rounded-3xl bg-[#3E065F] hover:bg-[#700B97] transition-all duration-300 transform hover:scale-105">
              <h3 className="text-3xl font-semibold mb-6">Customizable Experience</h3>
              <p className="text-xl text-gray-300">Personalize your chat experience with various settings and preferences to match your style.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-[#3E065F] text-white scroll-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-[#8E05C2] to-[#700B97] bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-10 rounded-3xl bg-[#000000]/30 backdrop-blur-lg border border-[#8E05C2]/20">
              <p className="text-2xl text-gray-300 mb-6">"The conversations feel incredibly natural. It's like talking to the real historical figures!"</p>
              <p className="text-xl font-semibold">- Sarah M.</p>
            </div>
            <div className="p-10 rounded-3xl bg-[#000000]/30 backdrop-blur-lg border border-[#8E05C2]/20">
              <p className="text-2xl text-gray-300 mb-6">"I've learned more about history through these conversations than I did in school."</p>
              <p className="text-xl font-semibold">- James K.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#000000] text-white scroll-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-[#8E05C2] to-[#700B97] bg-clip-text text-transparent">
            Ready to Start Your Journey?
          </h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of users who are already experiencing the future of AI conversations.
          </p>
          <TransitionLink href="/personas">
            <Button size="lg" className="magnetic-button text-xl bg-[#8E05C2] hover:bg-[#700B97] px-12 py-8 rounded-full transform hover:scale-105 transition-all duration-300">
              Start Chatting Now
            </Button>
          </TransitionLink>
        </div>
      </section>
    </div>
  );
}
