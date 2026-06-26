module.exports = ({ config }) => {
  const projectId = process.env.EAS_PROJECT_ID;
  const owner = process.env.EAS_OWNER;

  return {
    ...config,
    ...(owner ? { owner } : {}),
    extra: {
      ...config.extra,
      ...(projectId
        ? {
            eas: {
              projectId,
            },
          }
        : {}),
    },
  };
};
