module.exports = {
  apps: [
    {
      name: 'schemaflow-backend',
      script: 'pnpm',
      args: 'run dev',
      cwd: './backend',
      watch: false,
      env: {
        NODE_ENV: 'development',
      }
    },
    {
      name: 'schemaflow-frontend',
      script: 'pnpm',
      args: 'run dev',
      cwd: './frontend',
      watch: false,
      env: {
        NODE_ENV: 'development',
      }
    }
  ]
};
