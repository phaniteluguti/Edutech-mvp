'use client';

import { useEffect, useState } from 'react';

interface PasswordStrengthProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
  feedback: string[];
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState<StrengthResult>({
    score: 0,
    label: '',
    color: '',
    bgColor: '',
    feedback: [],
  });

  useEffect(() => {
    if (!password) {
      setStrength({
        score: 0,
        label: '',
        color: '',
        bgColor: '',
        feedback: [],
      });
      return;
    }

    const result = calculateStrength(password);
    setStrength(result);
  }, [password]);

  const calculateStrength = (pwd: string): StrengthResult => {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (pwd.length >= 8) score++;
    else feedback.push('At least 8 characters');

    if (pwd.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) {
      score++;
    } else {
      feedback.push('Mix of uppercase and lowercase');
    }

    if (/\d/.test(pwd)) {
      score++;
    } else {
      feedback.push('Include numbers');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      score++;
    } else {
      feedback.push('Include special characters (!@#$...)');
    }

    // Common patterns (reduce score)
    const commonPatterns = [
      /^password/i,
      /^123/,
      /^qwerty/i,
      /^abc/i,
    ];

    if (commonPatterns.some(pattern => pattern.test(pwd))) {
      score = Math.max(0, score - 2);
      feedback.push('Avoid common patterns');
    }

    // Map score to label and color
    const strengthLevels = [
      { label: 'Very Weak', color: 'text-red-600', bgColor: 'bg-red-600' },
      { label: 'Weak', color: 'text-orange-600', bgColor: 'bg-orange-600' },
      { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-600' },
      { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-600' },
      { label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-600' },
    ];

    const level = strengthLevels[Math.min(score, 4)];

    return {
      score: Math.min(score, 4),
      label: level.label,
      color: level.color,
      bgColor: level.bgColor,
      feedback: feedback.slice(0, 3), // Show max 3 tips
    };
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bars */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all ${
              level <= strength.score
                ? strength.bgColor
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Label */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${strength.color}`}>
          {strength.label}
        </span>
        {strength.score >= 3 && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure
          </span>
        )}
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && strength.score < 3 && (
        <div className="text-xs text-gray-600 space-y-1">
          {strength.feedback.map((tip, index) => (
            <div key={index} className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
