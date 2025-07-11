const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://3eb5865d7ca5e2f95ce90f65102ccc93@o4509651826442240.ingest.de.sentry.io/4509651831423056",

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
