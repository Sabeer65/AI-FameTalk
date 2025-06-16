import React from "react";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
            {/* Placeholder for an avatar image */}
            <span className="text-4xl font-bold">U</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">User Name</h1>
            <p className="text-gray-400">user.name@example.com</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-600 pb-2">
            My Created Personas
          </h2>
          <div className="space-y-3">
            {/* Placeholder for user's created bots */}
            <p className="p-4 bg-gray-700 rounded-lg">
              No personas created yet.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-600 pb-2">
            Account Settings
          </h2>
          <button className="w-full text-left p-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
