'use client';

import React from 'react';
import { ShieldCheck, Heart, FileText, Edit3, Calendar, MapPin, Mail, Phone } from 'lucide-react';
import { UserProfile } from '@/types';
import { Button } from '@/components/buttons/Button';

interface ProfileOverviewProps {
  user: UserProfile;
  savedVehiclesCount: number;
  savedReportsCount: number;
  onEditProfile: () => void;
}

export function ProfileOverview({
  user,
  savedVehiclesCount,
  savedReportsCount,
  onEditProfile,
}: ProfileOverviewProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-8">
      {/* Profile Main Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center border-2 border-emerald-200 shadow-md shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.name}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Resident
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">{user.email}</p>
            </div>
          </div>

          <Button size="sm" variant="outline" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={onEditProfile}>
            Edit Profile
          </Button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">Email Address</div>
              <div className="font-bold text-slate-900 truncate">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">Phone Number</div>
              <div className="font-bold text-slate-900">
                {user.phone ? user.phone : <span className="text-slate-400 font-normal italic">Not provided — edit to add</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">State & City</div>
              <div className="font-bold text-slate-900">
                {(user.city || user.state)
                  ? `${user.city || ''}${user.city && user.state ? ', ' : ''}${user.state || ''}`
                  : <span className="text-slate-400 font-normal italic">Not provided</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">Member Since</div>
              <div className="font-bold text-slate-900">{user.memberSince || 'July 2026'}</div>
            </div>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Profile Completion</span>
            <span className="text-emerald-700">{user.profileCompletionPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${user.profileCompletionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bookmarked Models</div>
            <div className="text-3xl font-extrabold text-slate-900">{savedVehiclesCount}</div>
            <div className="text-xs text-emerald-700 font-semibold">Empanelled EVs Saved</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subsidy Reports</div>
            <div className="text-3xl font-extrabold text-slate-900">{savedReportsCount}</div>
            <div className="text-xs text-emerald-700 font-semibold">Calculations Saved</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
        </div>
      </div>
    </div>
  );
}
