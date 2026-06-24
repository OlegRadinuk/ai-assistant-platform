// PM2 ecosystem config — ai-assistant-platform
// Secrets are NOT stored here. PM2 picks them up from .env.local via Next.js.
// To change the subdomain/port — search for DEPLOY_PORT and DEPLOY_SUBDOMAIN comments below.

module.exports = {
  apps: [
    {
      name: "ai-assistant-platform",

      // next start reads PORT from env; we set it here so PM2 owns the port.
      script: "npm",
      args: "start",

      cwd: "/var/www/ai-assistant-platform", // change if you clone elsewhere

      instances: 1,
      exec_mode: "fork",

      env: {
        NODE_ENV: "production",
        PORT: 3100, // DEPLOY_PORT — must match nginx proxy_pass below
      },

      // Restart policy
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",

      // Logs
      error_file: "/var/log/pm2/ai-assistant-platform-error.log",
      out_file:   "/var/log/pm2/ai-assistant-platform-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Give Next.js time to finish graceful shutdown
      kill_timeout: 5000,
    },
  ],
}
