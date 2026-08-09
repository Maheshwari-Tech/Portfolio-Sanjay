# Portfolio LeetCode Sync

This browser helper keeps the LeetCode session inside the browser and sends only question statuses, recent submissions, and aggregate solved counts to the interview tracker.

## Install in Chrome or Edge

1. Unzip `leetcode-sync-extension.zip`.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the unzipped folder.
5. Reload `/interview-tracker`, then choose **Refresh LeetCode status**.

## Install in Firefox

1. Unzip `leetcode-sync-extension.zip`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Choose **Load Temporary Add-on** and select `manifest.json` in the unzipped folder.
4. Reload `/interview-tracker`, then choose **Refresh LeetCode status**.

Firefox's temporary installation lasts until Firefox restarts. A permanently signed add-on can be distributed later without changing the sync flow.

The helper uses the LeetCode account signed in within the browser. Progress is stored only in that visitor's browser. The extension never reads or transmits the `LEETCODE_SESSION` cookie.

After updating the helper, reload it from your browser's extension page and reload the tracker tab.

Version 1.4 requests only the questions in the company bank currently open in the tracker.
