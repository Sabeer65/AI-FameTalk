"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, TextPlugin, SplitText);

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
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

      // Profile sections animation
      gsap.utils.toArray(".profile-section").forEach((section: any) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: "top bottom-=100",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 50,
          duration: 0.8,
        });
      });

      // Parallax effect
      gsap.to(".parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".profile-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/user/image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Profile image updated successfully!");
      } else {
        setMessage("Failed to update profile image.");
      }
    } catch (error) {
      setMessage("An error occurred while updating profile image.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setMessage("Password updated successfully!");
      } else {
        setMessage("Failed to update password.");
      }
    } catch (error) {
      setMessage("An error occurred while updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={mainRef} className="min-h-screen bg-[#1A1A2E] profile-section">
      <div className="absolute inset-0 parallax-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF3366]/10 to-[#1A1A2E]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FF3366] to-[#6C63FF]"
          >
            Profile Settings
          </h1>
          <p
            ref={subtitleRef}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Manage your account settings and preferences
          </p>
        </div>

        {message && (
          <div className="mb-8 p-4 rounded-xl bg-[#FF3366]/10 border border-[#FF3366]/20 text-[#FF3366]">
            {message}
          </div>
        )}

        <div className="space-y-12">
          {/* Profile Image Section */}
          <div className="profile-section bg-[#1A1A2E]/80 backdrop-blur-lg rounded-2xl p-8 border border-[#FF3366]/20">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Profile Image
            </h2>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FF3366] to-[#6C63FF] flex items-center justify-center text-white text-3xl font-bold">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#6C63FF] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Change Image
                </label>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="profile-section bg-[#1A1A2E]/80 backdrop-blur-lg rounded-2xl p-8 border border-[#FF3366]/20">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1A2E] border border-[#FF3366]/20 text-white focus:outline-none focus:border-[#FF3366]"
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1A2E] border border-[#FF3366]/20 text-white focus:outline-none focus:border-[#FF3366]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#6C63FF] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
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
