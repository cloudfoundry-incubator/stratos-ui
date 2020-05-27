import * as fs from 'fs';
import * as path from 'path';

import { Logger } from './log';
import { StratosConfig } from './stratos.config';

const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');

export interface PackageBuildInfo {
  command: string;
  args: string[];
}

export interface PackageInfo {
  name: string;
  dir: string;
  stratos: boolean;
  json: any;
  build: PackageBuildInfo;
  ignore: boolean;
  extension?: ExtensionMetadata;
  theme: boolean;
  theming?: ThemingConfig;
  assets: AssetConfig[];
}

export interface PackageJson {
  name: string;
  stratos?: StratosPakageMetadata;
  scripts: {[key:string]: string};
}

export interface StratosPakageMetadata {
  module?: string;
  routingModule?: string;
  ignore?: boolean;
  theme?: boolean;
  theming?: string;
  assets?: {[src:string]: string};
}

export interface ThemingConfig {
  ref: string;
  package: string;
  scss: string;
  mixin: string;
  importPath: string;
}

export interface ExtensionMetadata {
  package: string;
  module: string;
  routingModule?: string;
  themeable?: boolean;
}

export interface AssetConfig {
  from: string,
  to: string,
  force: boolean
}

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source).map(name => join(source, name)).filter(isDirectory);

// Default theme to use
export const DEFAULT_THEME = '@stratosui/theme';

export class Packages {

  public packages: PackageInfo[] = [];
  public packageMap: Map<string, PackageInfo> = new Map<string, PackageInfo>();

  public pkgReadMap: Map<string, PackageInfo> = new Map<string, PackageInfo>();

  public theme: PackageInfo;

  public logger: Logger;

  constructor(public config: StratosConfig, public nodeModulesFolder: string, public localPackagesFolder) { }

  public setLogger(logger: Logger) {
    this.logger = logger;
  }

  public log(msg: string) {
    if (this.logger) {
      this.logger.log(msg);
    }
  }

  // Look for packages
  public scan(packageJson: any) {
    this.pkgReadMap = new Map<string, PackageInfo>();

    if (packageJson.peerDependencies) {
      Object.keys(packageJson.peerDependencies).forEach(dep => {
        this.addPackage(dep);
      });
    }

    // Read all dependencies
    if (packageJson.dependencies) {
      Object.keys(packageJson.dependencies).forEach(dep => {
        this.addPackage(dep)
      });
    }

    // Local folders
    // Find all local packages in the folder
    const p = getDirectories(this.localPackagesFolder).forEach(pkgDir => {
      const pkgInfo: any = {
        dir: pkgDir
      };

      this.addPackage(pkgDir, true);
    });

    // Figure out the theme
    if (!this.config.stratosConfig.theme) {
      // Theme was not set, so find the first theme that is not the default theme
      const theme = this.packages.find(pkg => pkg.theme && pkg.name !== DEFAULT_THEME)
      if (!theme) {
        this.theme = this.packageMap[DEFAULT_THEME];
      } else {
        this.theme = theme;
      }
    } else {
      this.theme = this.packageMap[this.config.stratosConfig.theme];
    }

    // Ensure that the theme is last in the list, so that its resources are copied last
    const index = this.packages.findIndex(pkg => pkg.name === this.theme.name);
    if (index > -1) {
      const items = this.packages.splice(index, 1);
      this.packages.push(items[0]);
    }

    this.log('Packages:');
    this.packages.forEach(pkg => this.log('  ' + pkg.name));
  }

  public addPackage(pkgName, isLocal = false) {
    if (this.pkgReadMap[pkgName]) {
      return;
    }
    this.pkgReadMap[pkgName] = true;

    let pkgDir = pkgName;
    if (!isLocal) {
      pkgDir = path.join(this.nodeModulesFolder, pkgName);
    }

    // Read the package file
    const pkgFile = this.loadPackageFile(pkgDir);
    if (pkgFile !== null) {
      // Check to see if we should include this package
      if (this.includePackage(pkgFile))  {
        // Process all of the peer dependencies first
        if (pkgFile.peerDependencies) {
          Object.keys(pkgFile.peerDependencies).forEach(dep => this.addPackage(dep));
        }
        const pkg = this.processPackage(pkgFile, pkgDir);
        this.add(pkg);
      }
    }
  }

  // Try and find and load a package.json file in the specified folder
  public loadPackageFile(dir: string) {
    const pkgFile = path.join(dir, 'package.json');
    let pkg = null;
    if (fs.existsSync(pkgFile)) {
      try {
        pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8').toString());
      } catch(e) {}
    }
    return pkg;
  }

  private add(item: PackageInfo) {
    if (!this.packageMap[item.name]) {
      // We don't already have this package
      this.packages.push(item);
      this.packageMap[item.name] = item;
    }
  }

  // Get all of the extensions
  public getExtensions(): ExtensionMetadata[] {
    const extensions: ExtensionMetadata[] = [];
    this.packages.forEach(pkg => {
      if (pkg.extension) {
        extensions.push(pkg.extension);
      }
    });

    return extensions;
  }

  // Should we include the specified package?
  private includePackage(pkg: PackageJson): boolean {

    // Must be a stratos package
    if (!pkg.stratos) {
      return false;
    }

    // If we don't have any explicit includes, then include it
    if (!this.config.stratosConfig.packages) {
      return true;
    }

    // Use the include set if one is specified
    if (this.config.stratosConfig.packages.include) {
      return this.config.stratosConfig.packages.include.includes(pkg.name);
    }

    // Remove any excluded extensions
    if (this.config.stratosConfig.packages.exclude) {
      return !this.config.stratosConfig.packages.exclude.includes(pkg.name);
    }

    return true;
  }

  // Process the package file and look for Stratos metadata
  private processPackage(pkg: PackageJson, folder: string): PackageInfo {

    const info: PackageInfo = {
      name: pkg.name,
      dir: folder,
      stratos: !!pkg.stratos,
      json: pkg,
      build: this.getBuildCommand(pkg),
      ignore: pkg.stratos ? pkg.stratos.ignore || false : false,
      theme: pkg.stratos && pkg.stratos.theme,
      theming: this.getThemingConfig(pkg, folder),
      assets: this.getAssets(pkg, folder)
    };

    // If this is an extension, add extension metadata
    if (pkg.stratos && pkg.stratos.module) {
      info.extension = {
        package: pkg.name,
        module: pkg.stratos.module,
        routingModule: pkg.stratos.routingModule
      };
    }

    return info;
  }

  // Get any theming metadata - this allows a package to theme its own components using the theme
  private getThemingConfig(pkg: PackageJson, packagePath: string): ThemingConfig {
    if (pkg.stratos && pkg.stratos.theming) {
      const refParts = pkg.stratos.theming.split('#');
      if (refParts.length === 2) {
        const themingConfig: ThemingConfig = {
          ref: pkg.stratos.theming,
          package: pkg.name,
          scss: refParts[0],
          mixin: refParts[1],
          importPath: path.join(packagePath, refParts[0])
        };
        this.log('Found themed package: ' + pkg.name + ' (' + pkg.stratos.theming + ')');
        return themingConfig;
      } else {
        this.log('Invalid theming reference: ' + pkg.stratos.theming);
      }
    }

    return null;
  }

  // Get any assets that the package has
  private getAssets(pkg: PackageJson, packagePath: string): AssetConfig[] {
    const assets: AssetConfig[] = [];
    // Check for assets
    if (pkg.stratos && pkg.stratos.assets) {
      Object.keys(pkg.stratos.assets).forEach(src => {
        let abs = path.join(packagePath, src);
        abs = path.resolve(abs);
        assets.push({
          from: abs,
          to: pkg.stratos.assets[src],
          force: true
        });
      });
    }
    return assets.length ? assets : null;
  }

  private getBuildCommand(pkg: PackageJson): PackageBuildInfo {
    if (pkg.scripts && pkg.scripts.build) {
      return {
        command: 'npm',
        args: [ 'run', 'build' ]
      };
    } else {
      // Look for a matching project in the angular.json file
      if (this.config.angularJson) {
        let ngBuild = false;
        let ngBuildProject = pkg.name;
        // First match on full name
        ngBuild = !!this.config.angularJson.projects[ngBuildProject];
        if (!ngBuild) {
          // Now try matching on the name without the scope
          const parts = pkg.name.split('/');
          ngBuildProject = parts[1];
          if (parts.length === 2) {
            ngBuild = !!this.config.angularJson.projects[ngBuildProject];
          }
        }

        if (ngBuild) {
          // Need to verify that
          return {
            command: 'ng',
            args: [ 'build', '--project=' + ngBuildProject]
          };
        }
      }
    }

    return null;
  }
}
