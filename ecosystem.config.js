module.exports = {
  apps: [
    {
      name: "deepfake",
      script: "npm",
      args: "start -- -p 3000 -H 0.0.0.0",
      //   cwd: "/home/deploy/projects/deepfake",
      exec_mode: "fork", // prevent unwanted clustering
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0", // still good to have, but -H flag is decisive
        PORT: "3000",
      },
      instances: 1, // or 'max' if you want cluster mode
      autorestart: true,
      max_restarts: 10,
    },
  ],
};
