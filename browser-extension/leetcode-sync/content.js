(() => {
  "use strict";

  const pendingKey = "portfolioLeetCodeSync";
  const completedKey = "portfolioLeetCodeCompletedSync";
  const acknowledgedKey = "portfolioLeetCodeSyncAcknowledged";
  const allowedOrigins = new Set([
    "http://localhost:3001",
    "http://portfolio.localtest.me:3001",
    "https://portfolio-sanjay-tech.vercel.app"
  ]);
  let activeConfig = null;
  const extensionApi = globalThis.browser || globalThis.chrome;

  async function setupTrackerRelay() {
    document.documentElement.setAttribute("data-portfolio-leetcode-helper", "ready");
    const relay = async () => {
      const completed = (await extensionApi.storage.local.get(completedKey))[completedKey];
      if (!completed || completed.callbackOrigin !== window.location.origin) return;
      window.postMessage({
        type: "portfolio-leetcode-sync",
        token: completed.token,
        payload: completed.payload
      }, window.location.origin);
    };
    window.addEventListener("message", async event => {
      if (event.origin !== window.location.origin || event.data?.type !== "portfolio-leetcode-sync-ack") return;
      const completed = (await extensionApi.storage.local.get(completedKey))[completedKey];
      if (completed?.token === event.data.token) {
        await extensionApi.storage.local.set({[acknowledgedKey]: {token: completed.token, acknowledgedAt: Date.now()}});
        await extensionApi.storage.local.remove([completedKey, pendingKey]);
      }
    });
    extensionApi.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[completedKey]) void relay();
    });
    await relay();
    window.setTimeout(() => { void relay(); }, 1200);
  }

  const accountQuery = `
    query PortfolioBrowserAccount {
      isCurrentUserAuthenticated
      userStatus { username isSignedIn }
    }
  `;

  const profileQuery = `
    query PortfolioBrowserProfile($username: String!) {
      recentSubmissionList(username: $username, limit: 100) {
        id title titleSlug timestamp statusDisplay lang
      }
      matchedUser(username: $username) {
        username
        submitStatsGlobal { acSubmissionNum { difficulty count submissions } }
      }
    }
  `;

  function decodeConnection(encoded) {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const bytes = Uint8Array.from(atob(padded), character => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function validConfig(value) {
    return value && typeof value.token === "string" && value.token.length >= 32 &&
      allowedOrigins.has(value.callbackOrigin) && typeof value.companyName === "string" &&
      value.companyName.length > 0 && value.companyName.length <= 100 &&
      Array.isArray(value.questionSlugs) && value.questionSlugs.length > 0 && value.questionSlugs.length <= 200 &&
      value.questionSlugs.every(slug => typeof slug === "string" && /^[a-z0-9-]+$/.test(slug));
  }

  function showPanel(title, message, action) {
    document.getElementById("portfolio-leetcode-sync-panel")?.remove();
    const panel = document.createElement("aside");
    panel.id = "portfolio-leetcode-sync-panel";
    panel.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:2147483647;width:min(360px,calc(100vw - 40px));padding:18px;border:1px solid #3b3b34;border-radius:10px;background:#f7f5ed;color:#171815;box-shadow:0 18px 55px rgba(0,0,0,.24);font:14px/1.45 Arial,sans-serif";
    const heading = document.createElement("strong");
    heading.textContent = title;
    heading.style.cssText = "display:block;margin-bottom:7px;font-size:15px";
    const copy = document.createElement("p");
    copy.textContent = message;
    copy.style.cssText = "margin:0;color:#55564f";
    panel.append(heading, copy);
    if (action) {
      const button = document.createElement("button");
      button.textContent = action.label;
      button.style.cssText = "margin-top:14px;padding:9px 12px;border:0;border-radius:6px;background:#171815;color:#fff;font-weight:700;cursor:pointer";
      button.addEventListener("click", action.run);
      panel.append(button);
    }
    document.body.append(panel);
  }

  function normalizedStatus(status) {
    const value = String(status || "").toUpperCase();
    if (["SOLVED", "AC", "ACCEPTED"].includes(value)) return "solved";
    if (["ATTEMPTED", "NOT_AC", "TRIED"].includes(value)) return "attempted";
    return "not_started";
  }

  function csrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function graphqlHeaders() {
    const headers = {"Content-Type": "application/json"};
    const token = csrfToken();
    if (token) headers["X-CSRFToken"] = token;
    return headers;
  }

  async function graphqlRequest(operationName, query, variables = {}) {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      credentials: "include",
      headers: graphqlHeaders(),
      body: JSON.stringify({
        operationName,
        query,
        variables
      })
    });
    if (!response.ok) throw new Error("LeetCode did not accept the status request.");
    const result = await response.json();
    if (result.errors?.length) throw new Error("LeetCode progress is temporarily unavailable.");
    return result;
  }

  function companyProgressQuery(slugs) {
    const fields = slugs.map((slug, index) =>
      `q${index}: question(titleSlug: ${JSON.stringify(slug)}) { titleSlug status }`
    ).join("\n");
    return `query PortfolioCompanyProgress {\n${fields}\n}`;
  }

  async function synchronize(config) {
    activeConfig = config;
    const requestedSlugs = [...new Set(config.questionSlugs)];
    showPanel("Portfolio LeetCode Sync", `Checking ${requestedSlugs.length} ${config.companyName} questions…`);
    const accountResult = await graphqlRequest("PortfolioBrowserAccount", accountQuery);
    if (!accountResult?.data?.isCurrentUserAuthenticated || !accountResult.data.userStatus?.isSignedIn) {
      showPanel(
        "Sign in to continue",
        `Sign in to LeetCode normally. ${config.companyName} sync will continue when you return.`,
        {label: "Sign in to LeetCode", run: () => { window.location.href = "/accounts/login/?next=/problemset/"; }}
      );
      return;
    }
    const username = accountResult.data.userStatus.username;
    if (!username) throw new Error("LeetCode did not return the signed-in username.");
    const questions = [];
    const chunkSize = 40;
    for (let offset = 0; offset < requestedSlugs.length; offset += chunkSize) {
      const chunk = requestedSlugs.slice(offset, offset + chunkSize);
      const result = await graphqlRequest("PortfolioCompanyProgress", companyProgressQuery(chunk));
      questions.push(...Object.values(result.data || {}).filter(Boolean));
      showPanel("Portfolio LeetCode Sync", `Checked ${Math.min(offset + chunk.length, requestedSlugs.length)} of ${requestedSlugs.length} ${config.companyName} questions…`);
    }
    const profileResponse = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      credentials: "include",
      headers: graphqlHeaders(),
      body: JSON.stringify({operationName: "PortfolioBrowserProfile", query: profileQuery, variables: {username}})
    });
    if (!profileResponse.ok) throw new Error("LeetCode did not return profile activity.");
    const profileResult = await profileResponse.json();
    if (profileResult.errors?.length || !profileResult.data?.matchedUser) throw new Error("LeetCode progress is temporarily unavailable.");
    const questionStatuses = Object.fromEntries(
      questions.filter(item => item.titleSlug).map(item => [item.titleSlug, normalizedStatus(item.status)])
    );
    const complete = requestedSlugs.every(slug => Object.hasOwn(questionStatuses, slug));
    const recentSubmissions = (profileResult.data.recentSubmissionList || []).map(item => ({
      id: String(item.id || `${item.titleSlug}-${item.timestamp}`),
      title: item.title || "Untitled question",
      title_slug: item.titleSlug || "",
      timestamp: Number(item.timestamp || 0),
      status: item.statusDisplay || "Unknown",
      language: item.lang || ""
    })).filter(item => item.title_slug);
    const solvedCounts = profileResult.data.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
    const completed = {
      type: "portfolio-leetcode-sync",
      token: config.token,
      callbackOrigin: config.callbackOrigin,
      payload: {
        username,
        sync_scope: "company",
        company_name: config.companyName,
        requested_question_slugs: requestedSlugs,
        question_statuses: questionStatuses,
        question_statuses_complete: complete,
        recent_submissions: recentSubmissions,
        solved_counts: solvedCounts
      }
    };
    await extensionApi.storage.local.remove(acknowledgedKey);
    await extensionApi.storage.local.set({[completedKey]: completed});
    if (window.opener) {
      window.opener.postMessage(completed, config.callbackOrigin);
      showPanel("Progress collected", `${Object.keys(questionStatuses).length} of ${requestedSlugs.length} ${config.companyName} statuses are ready. Return to the tracker.`);
    } else {
      showPanel("Progress collected", `${Object.keys(questionStatuses).length} of ${requestedSlugs.length} ${config.companyName} statuses are ready. Return to the tracker.`);
    }
  }

  window.addEventListener("message", event => {
    if (!activeConfig || event.origin !== activeConfig.callbackOrigin || event.data?.token !== activeConfig.token) return;
    if (event.data.type === "portfolio-leetcode-sync-ack") {
      extensionApi.storage.local.remove([pendingKey, completedKey]);
      showPanel("Sync complete", "Your interview tracker now has the latest LeetCode progress.");
      window.setTimeout(() => window.close(), 1400);
    }
    if (event.data.type === "portfolio-leetcode-sync-error") {
      showPanel("Sync could not finish", event.data.detail || "Return to the tracker and try again.");
    }
  });

  extensionApi.storage.onChanged.addListener((changes, area) => {
    const acknowledgement = changes[acknowledgedKey]?.newValue;
    if (area !== "local" || !activeConfig || acknowledgement?.token !== activeConfig.token) return;
    showPanel("Sync complete", `${activeConfig.companyName} question status is updated in your interview tracker.`);
    extensionApi.storage.local.remove(acknowledgedKey);
    window.setTimeout(() => window.close(), 1400);
  });

  async function start() {
    try {
      if (allowedOrigins.has(window.location.origin)) {
        await setupTrackerRelay();
        return;
      }
      const marker = window.location.hash.match(/(?:^#|&)portfolio-sync=([^&]+)/);
      let config = null;
      if (marker) {
        config = decodeConnection(marker[1]);
        if (!validConfig(config)) throw new Error("This connection link is not valid for the portfolio tracker.");
        await extensionApi.storage.local.set({[pendingKey]: config});
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      } else {
        config = (await extensionApi.storage.local.get(pendingKey))[pendingKey] || null;
      }
      if (validConfig(config)) await synchronize(config);
    } catch (error) {
      showPanel("LeetCode sync error", error instanceof Error ? error.message : "Progress could not be synchronized.");
    }
  }

  void start();
})();
