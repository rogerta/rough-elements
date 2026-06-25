/** @param {import("@11ty/eleventy").UserConfig} config */
export default function(config) {
  config.setInputDirectory('./docs')
  config.setOutputDirectory('./dist/docs')
  config.setQuietMode(true)
  config.setServerOptions({
    port: 9520,
  });
}

