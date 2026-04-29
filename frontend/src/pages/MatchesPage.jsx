import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI } from '../services/api';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await matchAPI.getMatches();
        setMatches(data.matches || []);
      } catch (err) {
        setError(err.message || 'Could not fetch matches.');
      }
    };

    loadMatches();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Match recommendations</h2>
        <p className="mt-2 text-slate-600">Browse profiles of other members whose skills complement yours.</p>
      </section>
      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{match.name}</h3>
                  <p className="text-sm text-slate-600">{match.bio || 'No bio available'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">Rating {(match.rating?.average ?? 0).toFixed(1)}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div>Offers: {match.skillsOfferedSimple?.join(', ') || 'N/A'}</div>
                <div>Wants: {match.skillsWantedSimple?.join(', ') || 'N/A'}</div>
                <div className="font-medium text-green-600">
                  Match Score: {match.matchScore || 0}
                  {match.matchDetails && (
                    <span className="text-xs text-slate-500 ml-2">
                      ({match.matchDetails.totalMatches} matches)
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/chat/${match._id}`} className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Chat</Link>
                <Link to={`/profile?id=${match._id}`} className="rounded border border-slate-300 px-4 py-2 text-slate-900 hover:bg-slate-50">View profile</Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">No compatible matches found yet. Try refining your skill preferences.</div>
        )}
      </div>
    </div>
  );
}

export default MatchesPage;
