import React, { useEffect, useState } from 'react';
import { matchAPI } from '../services/api';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);

    const loadMatches = async () => {
      try {
        setIsLoading(true);
        const data = await matchAPI.getMatches();
        setMatches(data.matches || []);
      } catch (err) {
        setError(err.message || 'Unable to load matches.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="card card-hover animate-fade-in-scale">
        <div className="p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-900 animate-slide-in-left">
            Welcome back, {user?.name || 'SkillSwapper'}! 👋
          </h2>
          <p className="text-slate-600 animate-slide-in-right animate-delay-200">
            Use SkillSwap Connect to find nearby skill partners, start a swap request, and build your review profile.
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-custom"></div>
              <span>Online</span>
            </div>
            <div className="text-sm text-slate-500">
              Ready to learn and teach! 🚀
            </div>
          </div>
        </div>
      </section>

      {/* Matches Section */}
      <section className="card card-hover animate-fade-in-up animate-delay-300">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recommended matches</h3>
            <a
              href="/matches"
              className="btn-ghost text-sm font-medium hover:text-slate-900 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>View all</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 animate-bounce-in">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4 loading-shimmer">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-3"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {matches.length > 0 ? (
                matches.slice(0, 4).map((match, index) => (
                  <div
                    key={match._id}
                    className={`card card-hover animate-fade-in-up animate-delay-${(index + 1) * 100} hover-scale cursor-pointer`}
                    onClick={() => window.location.href = `/matches`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-slate-900">{match.name}</h4>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-slate-600">{(match.rating?.average ?? 0).toFixed(1)}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {match.bio || 'No bio yet. Let\'s connect and share skills!'}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover-scale">
                          ⭐ Rating {(match.rating?.average ?? 0).toFixed(1)}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover-scale">
                          🎯 Offers {match.skillsOffered?.length || 0} skills
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <button className="w-full btn-primary text-sm py-2">
                          Connect & Learn
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <div className="card card-hover text-center py-12 animate-fade-in-scale">
                    <div className="mb-4">
                      <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No matches yet</h3>
                    <p className="text-slate-600 mb-4">Complete your profile with skills to find perfect matches!</p>
                    <a href="/profile" className="btn-primary inline-block">
                      Update Profile
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="card card-hover animate-fade-in-up animate-delay-500">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <a
              href="/matches"
              className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover-lift transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Find Matches</h4>
                <p className="text-sm text-slate-600">Discover skill partners</p>
              </div>
            </a>

            <a
              href="/chat"
              className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover-lift transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Start Chatting</h4>
                <p className="text-sm text-slate-600">Connect with matches</p>
              </div>
            </a>

            <a
              href="/profile"
              className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover-lift transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Update Profile</h4>
                <p className="text-sm text-slate-600">Add your skills</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
