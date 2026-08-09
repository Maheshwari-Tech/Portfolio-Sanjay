(() => {
  "use strict";

  const pendingKey = "portfolioLeetCodeSync";
  const completedKey = "portfolioLeetCodeCompletedSync";
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
        await extensionApi.storage.local.remove([completedKey, pendingKey]);
      }
    });
    extensionApi.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[completedKey]) void relay();
    });
    await relay();
    window.setTimeout(() => { void relay(); }, 1200);
  }

  const progressQuery = `
    query PortfolioBrowserProgress($skip: Int!, $limit: Int!, $filters: QuestionFilterInput) {
      isCurrentUserAuthenticated
      userStatus { username isSignedIn }
      problemsetQuestionListV2(skip: $skip, limit: $limit, filters: $filters) {
        questions { titleSlug status }
        hasMore
      }
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
      allowedOrigins.has(value.callbackOrigin);
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

  async function fetchProgressPage(skip, limit) {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      credentials: "include",
      headers: graphqlHeaders(),
      body: JSON.stringify({
        operationName: "PortfolioBrowserProgress",
        query: progressQuery,
        variables: {
          skip,
          limit,
          filters: {filterCombineType: "ALL"}
        }
      })
    });
    if (!response.ok) throw new Error("LeetCode did not accept the progress request.");
    const result = await response.json();
    if (result.errors?.length) throw new Error("LeetCode progress is temporarily unavailable.");
    return result;
  }

  async function synchronize(config) {
    activeConfig = config;
    showPanel("Portfolio LeetCode Sync", "Checking your signed-in LeetCode account…");
    const pageSize = 100;
    let skip = 0;
    let progressResult = null;
    const questions = [];
    while (true) {
      const pageResult = await fetchProgressPage(skip, pageSize);
      if (!progressResult) progressResult = pageResult;
      const page = pageResult.data?.problemsetQuestionListV2 || {};
      const pageQuestions = page.questions || [];
      questions.push(...pageQuestions);
      if (page.hasMore && pageQuestions.length === 0) throw new Error("LeetCode returned an incomplete progress page. Please try the sync again.");
      if (!page.hasMore) break;
      skip += pageQuestions.length;
      showPanel("Portfolio LeetCode Sync", `Loading your question progress… ${questions.length} checked`);
      if (skip > 10000) throw new Error("LeetCode returned too many progress pages to synchronize safely.");
    }
    if (!progressResult?.data?.isCurrentUserAuthenticated || !progressResult.data.userStatus?.isSignedIn) {
      showPanel(
        "Sign in to continue",
        "Sign in to LeetCode normally. Progress sync will continue when you return.",
        {label: "Sign in to LeetCode", run: () => { window.location.href = "/accounts/login/?next=/problemset/"; }}
      );
      return;
    }
    const username = progressResult.data.userStatus.username;
    if (!username) throw new Error("LeetCode did not return the signed-in username.");
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
        question_statuses: questionStatuses,
        question_statuses_complete: true,
        recent_submissions: recentSubmissions,
        solved_counts: solvedCounts
      }
    };
    await extensionApi.storage.local.set({[completedKey]: completed});
    if (window.opener) {
      window.opener.postMessage(completed, config.callbackOrigin);
      showPanel("Progress collected", `Sending ${Object.keys(questionStatuses).length} question statuses to your tracker…`);
    } else {
      showPanel("Progress collected", `Return to the tracker. ${Object.keys(questionStatuses).length} question statuses are ready and will sync automatically.`);
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
