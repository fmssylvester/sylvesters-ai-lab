import { Config } from "@remotion/cli/dist/config";

Config.setPublicDir("assets");
Config.overrideWebpackConfig((config) => {
  config.cache = false;
  return config;
});
