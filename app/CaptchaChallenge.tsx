"use client";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";

export type CaptchaProvider = "hcaptcha" | "turnstile";

type CaptchaApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    hcaptcha?: CaptchaApi;
    turnstile?: CaptchaApi;
  }
}

const providers = {
  hcaptcha: {
    scriptId: "portfolio-hcaptcha-script",
    src: "https://js.hcaptcha.com/1/api.js?render=explicit",
  },
  turnstile: {
    scriptId: "portfolio-turnstile-script",
    src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
  },
} as const;

export default function CaptchaChallenge({
  provider,
  siteKey,
  resetKey,
  onToken,
}: {
  provider: CaptchaProvider;
  siteKey: string;
  resetKey: number;
  onToken: Dispatch<SetStateAction<string | null>>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let widgetId: string | undefined;
    const config = providers[provider];

    const renderWidget = () => {
      const api = window[provider];
      const container = containerRef.current;
      if (disposed || !api || !container || widgetId) return;
      container.replaceChildren();
      widgetId = api.render(container, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    };

    let script = document.getElementById(config.scriptId) as HTMLScriptElement | null;
    const handleLoad = () => {
      if (script) script.dataset.loaded = "true";
      renderWidget();
    };
    const callbackName = `portfolioCaptchaLoaded_${provider}`;
    const callbackWindow = window as unknown as Record<string, unknown>;
    callbackWindow[callbackName] = handleLoad;
    if (!script) {
      script = document.createElement("script");
      script.id = config.scriptId;
      script.src = `${config.src}&onload=${callbackName}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    if (script.dataset.loaded === "true") renderWidget();

    return () => {
      disposed = true;
      if (callbackWindow[callbackName] === handleLoad) delete callbackWindow[callbackName];
      if (widgetId) window[provider]?.remove(widgetId);
      onToken(null);
    };
  }, [onToken, provider, resetKey, siteKey]);

  return <div className="captcha-shell" ref={containerRef} aria-label="Security verification" />;
}
