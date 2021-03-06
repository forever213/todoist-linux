const CONFIG_FILE_NAME = '.todoist-linux.json'

const {dialog} = require('electron')
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

class ShortcutConfig {
  constructor() {
    this.config = {};

    if (this.checkIfConfigFileExists()) {
      this.updateShortcutsFromConfigFile();
    } else {
      this.createDefaultConfigFile();
      this.updateShortcutsFromConfigFile();
    }

    this.mergeConfigWithDefaults();
  }

  // Make sure all shortcuts are defined.
  // In case some of them missed we will apply the default one
  mergeConfigWithDefaults() {
    this.config = Object.assign(this.getDefaultConfig(), this.config);
  }

  updateShortcutsFromConfigFile() {
    const configPath = this.getConfigFilename();

    try {
      this.config = JSON.parse(
        fs.readFileSync(
          new URL('file://' + configPath),
          'utf8'
        )
      );
    } catch (e) {
      dialog.showMessageBox({
        title: 'Config error',
        message: 'There is error in configuration file. Please make sure it has proper JSON. Default shortcuts will be used.'
      });
      this.config = this.getDefaultConfig();
    }
  }

  createDefaultConfigFile() {
    const configPath = this.getConfigFilename();

    fs.writeFileSync(
      configPath,
      JSON.stringify(
        this.getDefaultConfig(),
        null,
        4
      )
    );
  }

  getConfigDirectory() {
    if (process.platform == 'win32') {
      return process.env.HOMEDRIVE + process.env.HOMEPATH;
    }

    // if possible save config in $XDG_CONFIG_HOME
    // which is $HOME/.config by default
    if (process.env.XDG_CONFIG_HOME) {
      return process.env.XDG_CONFIG_HOME;
    }

    return process.env.HOME + '/.config';
  }

  getConfigFilename() {
    return path.join(
      this.getConfigDirectory(),
      CONFIG_FILE_NAME
    );
  }

  checkIfConfigFileExists() {
    const configPath = this.getConfigFilename();
    return fs.existsSync(configPath);
  }

  getDefaultConfig() {
    return {
      'quick-add': 'CommandOrControl+Alt+a',
      'show-hide': 'CommandOrControl+Alt+Q',
      'refresh': 'CommandOrControl+Alt+r',
      'beta': false,
      'quit': 'Alt+F4',
      'tray-icon': 'icon.png',
      'minimize-to-tray': true,
      'close-to-tray': true,
      'start-in-tray': false,
    }
  }
}

module.exports = {
  ShortcutConfig
};
