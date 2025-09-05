"use client";

import {
  CheckIcon,
  XIcon
} from "lucide-react";
import {useMemo} from "react";

export type PasswordRule = {
  expr: RegExp | ((password: string) => boolean);
  message: string;
}

export type PasswordRules = [PasswordRule, PasswordRule, PasswordRule, PasswordRule];

const defaultRequeriments: PasswordRules = [
  {expr: /.{8,}/, message: "At least 8 characters"},
  {expr: /\d/, message: "At least 1 number"},
  {expr: /[a-z]/, message: "At least 1 lowercase letter"},
  {expr: /[A-Z]/, message: "At least 1 uppercase letter"},
];

export interface PasswordStrengthIndicatorProps {
  password: string;
  roles?: PasswordRules;
}

export function evalRule(rule: PasswordRule, password: string) {
  return typeof rule.expr === "function" ? rule.expr(password) : rule.expr.test(password);
}

export function evalRules(rules: PasswordRules, password: string) {
  return rules.every(rule => evalRule(rule, password));
}

export function PasswordStrengthIndicator({password, roles = defaultRequeriments}: Readonly<PasswordStrengthIndicatorProps>) {
  const checkStrength = (pass: string) => {
    
    return roles.map((req) => ({
      met: evalRule(req, pass),
      text: req.message,
    }));
  };
  
  const strength = checkStrength(password);
  
  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);
  
  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };
  
  return (
    <div>
      <div
        className="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full"
        role="progress"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label="Password strength"
      >
        <div
          className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
          style={{width: `${(strengthScore / 4) * 100}%`}}
        ></div>
      </div>
      
      {/* Password requirements list */}
      <ul className="space-y-1.5" aria-label="Password requirements">
        {strength.map((req, index) => (
          <li key={index + ":)"} className="flex items-center gap-2">
            {req.met ? (
              <CheckIcon size={16} className="text-emerald-500" aria-hidden="true"/>
            ) : (
              <XIcon size={16} className="text-muted-foreground/80" aria-hidden="true"/>
            )}
            <span className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}>
              {req.text}
              <span className="sr-only">
                {req.met ? " - Requirement met" : " - Requirement not met"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
