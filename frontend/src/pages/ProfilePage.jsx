import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_ORIGIN, userAPI } from '../services/api';

const splitSkills = (value) =>
  value
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

const normalizeProfileImage = (path) => (path ? `${API_ORIGIN}/${path}`.replace(/([^:]\/)\/+/g, '$1') : null);

function ProfilePage() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    skillsToTeach: '',
    skillsToLearn: '',
    skillsOfferedSimple: '',
    skillsWantedSimple: '',
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      const localUser = JSON.parse(localStorage.getItem('user')) || {};
      const profileId = searchParams.get('id');

      try {
        if (profileId && profileId !== localUser._id) {
          const data = await userAPI.getUserProfile(profileId);
          const profile = data.user;
          setUser(profile);
          setForm({
            name: profile.name || '',
            bio: profile.bio || '',
            skillsToTeach: (profile.skillsToTeach || []).join(', '),
            skillsToLearn: (profile.skillsToLearn || []).join(', '),
            skillsOfferedSimple: (profile.skillsOfferedSimple || []).join(', '),
            skillsWantedSimple: (profile.skillsWantedSimple || []).join(', '),
          });
          setImagePreview(normalizeProfileImage(profile.profilePic));
          setIsReadOnly(true);
          return;
        }

        setUser(localUser);
        setForm({
          name: localUser.name || '',
          bio: localUser.bio || '',
          skillsToTeach: (localUser.skillsToTeach || []).join(', '),
          skillsToLearn: (localUser.skillsToLearn || []).join(', '),
          skillsOfferedSimple: (localUser.skillsOfferedSimple || []).join(', '),
          skillsWantedSimple: (localUser.skillsWantedSimple || []).join(', '),
        });
        setImagePreview(normalizeProfileImage(localUser.profilePic));
        setIsReadOnly(false);
      } catch (err) {
        setError(err.message || 'Unable to load profile.');
      }
    };

    loadProfile();
  }, [searchParams]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
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
      setError('Please add skills you can teach and want to learn first.');
      return;
    }

    setGeneratingBio(true);
    setError(null);
    setMessage(null);

    try {
      const data = await userAPI.generateBio({
        name: form.name || user?.name || 'User',
        teachSkills: splitSkills(form.skillsToTeach),
        learnSkills: splitSkills(form.skillsToLearn),
      });

      setForm((prev) => ({ ...prev, bio: data.bio }));
      setMessage('AI bio generated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to generate bio.');
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
      formData.append('teachSkills', JSON.stringify(splitSkills(form.skillsToTeach)));
      formData.append('learnSkills', JSON.stringify(splitSkills(form.skillsToLearn)));
      formData.append('skillsOfferedSimple', JSON.stringify(splitSkills(form.skillsOfferedSimple)));
      formData.append('skillsWantedSimple', JSON.stringify(splitSkills(form.skillsWantedSimple)));

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const data = await userAPI.updateProfile(user._id, formData);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setSelectedFile(null);
      setImagePreview(normalizeProfileImage(data.user.profilePic));
      setMessage('Profile updated successfully.');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message || 'Unable to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <section className="card p-8">
        <div className="flex items-center justify-center gap-3 py-10 text-slate-600">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <span>Loading profile...</span>
        </div>
      </section>
    );
  }

  const teachSkills = user.skillsToTeach || [];
  const learnSkills = user.skillsToLearn || [];

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden border-slate-200/80">
        <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#0f766e_100%)] px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="h-24 w-24 rounded-[1.5rem] border border-white/20 object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-white/20 bg-white/10 text-3xl font-semibold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/65">
                  {isReadOnly ? 'Public Profile' : 'Your Workspace Profile'}
                </p>
                <h1 className="mt-2 text-3xl font-semibold">{user.name}</h1>
                <p className="mt-2 text-sm text-white/75">{user.email}</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                  {user.bio || 'Add a strong introduction so people understand what you teach and what you want to learn.'}
                </p>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/15"
                >
                  Change Photo
                </button>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur">
                  Keep your profile current for better matches.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {!isReadOnly && selectedFile && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <p className="font-medium">Selected image: {selectedFile.name}</p>
          <p className="mt-1 text-amber-800">Save changes to upload this new profile image.</p>
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Profile Summary</h2>
            </div>
            {isReadOnly && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Read only
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Bio</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{user.bio || 'No bio added yet.'}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Skills I Teach</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {teachSkills.length > 0 ? (
                  teachSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">No teaching skills listed</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Skills I Want To Learn</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {learnSkills.length > 0 ? (
                  learnSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">No learning goals listed</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                {isReadOnly ? 'Profile Details' : 'Edit Profile'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                {isReadOnly ? 'Public profile information' : 'Keep your profile polished'}
              </h2>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleGenerateBio}
                disabled={generatingBio || !form.skillsToTeach.trim() || !form.skillsToLearn.trim()}
                className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-800 transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingBio ? 'Generating...' : 'Generate Bio'}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
            <label className="block">
              <span className="form-label">Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={isReadOnly}
                className="form-input disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="form-label">Bio</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                disabled={isReadOnly}
                rows="5"
                className="form-input min-h-[140px] resize-y disabled:cursor-not-allowed disabled:bg-slate-100"
                placeholder="Share what makes you a great skill partner."
              />
            </label>

            <label className="block">
              <span className="form-label">Skills I Can Teach</span>
              <input
                name="skillsToTeach"
                value={form.skillsToTeach}
                onChange={handleChange}
                disabled={isReadOnly}
                placeholder="JavaScript, Guitar, Public speaking"
                className="form-input disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="form-label">Skills I Want To Learn</span>
              <input
                name="skillsToLearn"
                value={form.skillsToLearn}
                onChange={handleChange}
                disabled={isReadOnly}
                placeholder="Python, Piano, Photography"
                className="form-input disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="form-label">Skills I Offer For Matching</span>
              <input
                name="skillsOfferedSimple"
                value={form.skillsOfferedSimple}
                onChange={handleChange}
                disabled={isReadOnly}
                placeholder="Frontend, Design reviews, Presentation coaching"
                className="form-input disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="form-label">Skills I Want For Matching</span>
              <input
                name="skillsWantedSimple"
                value={form.skillsWantedSimple}
                onChange={handleChange}
                disabled={isReadOnly}
                placeholder="Data structures, Excel, Branding"
                className="form-input disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            {isReadOnly ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                You are viewing a public profile. Editing is available only on your own account.
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Save after updating your skills, bio, or image.
                </p>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_35px_-20px_rgba(15,23,42,0.85)] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {updating ? 'Saving changes...' : 'Save changes'}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
