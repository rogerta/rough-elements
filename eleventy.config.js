/** @param {import("@11ty/eleventy").UserConfig} config */
export default function(config) {
  config.setInputDirectory('./docs')
  config.setOutputDirectory('./dist/docs')

  // Copy `img/` to output.  Note: the input directory prefix
  // is stripped from the file name before being copied to
  // the output.
  config.addPassthroughCopy('./docs/img')

  config.setQuietMode(true)
  config.setServerOptions({
    port: 9520,
  });
}

