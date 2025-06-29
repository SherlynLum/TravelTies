const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");
 
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;
 
module.exports = wrapWithReanimatedMetroConfig(withNativeWind(config, { input: './app/global.css' }));
