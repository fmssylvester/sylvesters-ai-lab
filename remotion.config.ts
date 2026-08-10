import { Config } from "@remotion/cli/dist/config";

Config.setPublicDir("assets");
Config.setConcurrency(2);
Config.setTimeoutInMilliseconds(300000);
Config.setDelayRenderTimeoutInMilliseconds(300000);
Config.overrideWebpackConfig((config) => {
  config.cache = false;
  return config;
});