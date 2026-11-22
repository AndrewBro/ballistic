// Metro bundles the shared ../core folder (physics, libraries, data model, drawings) alongside the app.
// Packages are resolved only from app/node_modules, so ../core's `react` import gets the app's React
// rather than the web app's copy in the repository root (two Reacts would break rendering).
const path=require('path')
const {getDefaultConfig}=require('expo/metro-config')
const config=getDefaultConfig(__dirname)
config.watchFolders=[path.resolve(__dirname,'../core')]
config.resolver.nodeModulesPaths=[path.resolve(__dirname,'node_modules')]
config.resolver.disableHierarchicalLookup=true
module.exports=config
