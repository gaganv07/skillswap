import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userAPI } from '../services/api';

function ProfilePage() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    skillsToTeach: '',
    skillsToLearn: '',
    skillsOfferedSimple: '',
    skillsWantedSimple: ''
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Profile image upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // AI Bio generation states
  const [generatingBio, setGeneratingBio] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const localUser = JSON.parse(localStorage.getItem('user')) || {};
      const profileId = searchParams.get('id');
      if (profileId && profileId !== localUser._id) {
        try {
          const data = await userAPI.getUserProfile(profileId);
          setUser(data.user);
          setForm({
            name: data.user.name || '',
            bio: data.user.bio || '',
            skillsToTeach: (data.user.skillsToTeach || []).join(', '),
            skillsToLearn: (data.user.skillsToLearn || []).join(', '),
            skillsOfferedSimple: (data.user.skillsOfferedSimple || []).join(', '),
            skillsWantedSimple: (data.user.skillsWantedSimple || []).join(', ')
          });
          setImagePreview(data.user.profilePic ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${data.user.profilePic}` : null);
          setIsReadOnly(true);
          return;
        } catch (err) {
          setError('Unable to load requested profile.');
        }
      }

      setUser(localUser);
      setForm({
        name: localUser.name || '',
        bio: localUser.bio || '',
        skillsToTeach: (localUser.skillsToTeach || []).join(', '),
        skillsToLearn: (localUser.skillsToLearn || []).join(', '),
        skillsOfferedSimple: (localUser.skillsOfferedSimple || []).join(', '),
        skillsWantedSimple: (localUser.skillsWantedSimple || []).join(', ')
      });
      setImagePreview(localUser.profilePic ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${localUser.profilePic}` : null);
      setIsReadOnly(false);
    };

    loadProfile();
  }, [searchParams]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateBio = async () => {
    if (!form.skillsToTeach.trim() || !form.skillsToLearn.trim()) {
      setError('Please add some skills you can teach and want to learn first.');
      return;
    }

    setGeneratingBio(true);
    setError(null);

    try {
      const teachSkills = form.skillsToTeach.split(',').map(s => s.trim()).filter(s => s);
      const learnSkills = form.skillsToLearn.split(',').map(s => s.trim()).filter(s => s);

      const data = await userAPI.generateBio({
        name: form.name || user?.name || 'User',
        teachSkills,
        learnSkills
      });

      setForm({ ...form, bio: data.bio });
      setMessage('Bio generated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to generate bio');
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('bio', form.bio);

      // Convert skills to arrays and then to JSON strings
      const teachSkills = form.skillsToTeach.split(',').map(s => s.trim()).filter(s => s);
      const learnSkills = form.skillsToLearn.split(',').map(s => s.trim()).filter(s => s);
      const skillsOfferedSimple = form.skillsOfferedSimple.split(',').map(s => s.trim()).filter(s => s);
      const skillsWantedSimple = form.skillsWantedSimple.split(',').map(s => s.trim()).filter(s => s);

      formData.append('teachSkills', JSON.stringify(teachSkills));
      formData.append('learnSkills', JSON.stringify(learnSkills));
      formData.append('skillsOfferedSimple', JSON.stringify(skillsOfferedSimple));
      formData.append('skillsWantedSimple', JSON.stringify(skillsWantedSimple));

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const data = await userAPI.updateProfile(user._id, formData);
      setMessage('Profile updated successfully.');
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setSelectedFile(null);

      if (data.user.profilePic) {
        setImagePreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}/${data.user.profilePic}`);
      }
    } catch (err) {
      setError(err.message || 'Unable to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return <div className="rounded-xl bg-white p-6 shadow-sm">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-200">
                <span className="text-2xl text-slate-500 font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-slate-900 text-white rounded-full p-2 hover:bg-slate-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-slate-600">{user.email}</p>
          </div>
        </div>

        {/* Image Upload Controls */}
        {!isReadOnly && selectedFile && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">Selected image</p>
            <p className="text-sm text-slate-600">{selectedFile.name}</p>
            <p className="mt-2 text-sm text-slate-500">Your selected image will be saved when you click Save changes.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setImagePreview(user?.profilePic ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${user.profilePic}` : null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="mt-3 inline-flex items-center rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Remove selection
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </section>

      {/* Profile Info Display */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Your profile</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-600">Name</p>
            <p className="text-lg font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Email</p>
            <p className="text-lg font-medium">{user.email}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-slate-600">Bio</p>
            <p className="text-lg font-medium">{user.bio || 'No bio yet.'}</p>
          </div>
          {user.skillsToTeach && user.skillsToTeach.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-slate-600">Skills I Teach</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.skillsToTeach.map((skill, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {user.skillsToLearn && user.skillsToLearn.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-slate-600">Skills I Want to Learn</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.skillsToLearn.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Update Profile Form */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Update profile</h3>
        {message && <div className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={isReadOnly}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          {/* Bio Section with AI Generator */}
          <div className="block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Bio</span>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleGenerateBio}
                  disabled={generatingBio || !form.skillsToTeach.trim() || !form.skillsToLearn.trim()}
                  className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  {generatingBio && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>✨ Generate with AI</span>
                </button>
              )}
            </div>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              disabled={isReadOnly}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              rows="4"
              placeholder="Tell us about yourself..."
            />
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Skills I Can Teach</span>
            <input
              name="skillsToTeach"
              value={form.skillsToTeach}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="e.g., JavaScript, Guitar, Cooking (comma separated)"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Skills I Want to Learn</span>
            <input
              name="skillsToLearn"
              value={form.skillsToLearn}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="e.g., Python, Piano, Photography (comma separated)"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Skills I Offer (for matching)</span>
            <input
              name="skillsOfferedSimple"
              value={form.skillsOfferedSimple}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="e.g., JavaScript, Guitar, Cooking (comma separated)"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Skills I Want (for matching)</span>
            <input
              name="skillsWantedSimple"
              value={form.skillsWantedSimple}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="e.g., Python, Piano, Photography (comma separated)"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          {!isReadOnly && (
            <button 
              type="submit" 
              disabled={updating}
              className="w-fit rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {updating && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{updating ? 'Updating...' : 'Save changes'}</span>
            </button>
          )}
          {isReadOnly && (
            <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600">
              Viewing a public profile. Updates are only available for your own account.
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;