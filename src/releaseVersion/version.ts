/*
 * @author: tisfeng
 * @createTime: 2022-07-01 19:05
 * @lastEditor: tisfeng
 * @lastEditTime: 2022-07-03 01:56
 * @fileName: version.ts
 *
 * Copyright (c) 2022 by tisfeng, All Rights Reserved.
 */

import { LocalStorage } from "@raycast/api";
import axios from "axios";

const versionInfoKey = "EasydictVersionInfoKey";
const githubUrl = "https://github.com";
const githubApiUrl = "https://api.github.com";

export class Easydict {
  static author = "tisfeng";
  static repo = "Raycast-Easydict";

  // new version info
  // static currentInfo = new Easydict("1.1.0", 3, "2022-07-01", true, false, "");

  // * NOTE: new version info, don't use it directly. Use getCurrentStoredVersionInfo() instead.
  version = "1.1.0";
  buildNumber = 3;
  versionDate = "2022-07-01";
  isNeedPrompt = true;
  hasPrompt = false; // only show once, then will be set to true
  releaseMarkdown = "";

  // version: string;
  // buildNumber: number;
  // versionDate: string;
  // isNeedPrompt: boolean;
  // hasPrompt: boolean;
  // releaseMarkdown: string;

  // constructor(
  //   version: string,
  //   buildNumber: number,
  //   versionDate: string,
  //   isNeedPrompt: boolean,
  //   hasPrompt: boolean,
  //   releaseMarkdown: string
  // ) {
  //   this.version = version;
  //   this.buildNumber = buildNumber;
  //   this.versionDate = versionDate;
  //   this.isNeedPrompt = isNeedPrompt;
  //   this.hasPrompt = hasPrompt;
  //   this.releaseMarkdown = releaseMarkdown;
  // }

  getRepoUrl() {
    return `${githubUrl}/${Easydict.author}/${Easydict.repo}`;
  }

  getReadmeUrl() {
    return `${githubUrl}/${Easydict.author}/${Easydict.repo}/#readme`;
  }

  getIssueUrl() {
    return `${githubUrl}/${Easydict.author}/${Easydict.repo}/issues`;
  }

  /**
   * 项目中文介绍 https://github.com/tisfeng/Raycast-Easydict/wiki
   */
  public getChineseWikiUrl() {
    return `${this.getRepoUrl}/wiki`;
  }

  /**
   *  Release tag url: /repos/{owner}/{repo}/releases/tags/{tag}
   *  https://api.github.com/repos/tisfeng/Raycast-Easydict/releases/tags/1.1.0
   */
  public getReleaseApiUrl() {
    return `${githubApiUrl}/repos/${Easydict.author}/${Easydict.repo}/releases/tags/${this.version}`;
  }

  /**
   * Get current version info, return a promise EasydictInfo.
   */
  async getCurrentStoredVersionInfo(): Promise<Easydict> {
    const currentVersionKey = `${versionInfoKey}-${this.version}`;
    const currentVersionInfo = await this.getVersionInfo(currentVersionKey);
    if (currentVersionInfo) {
      return Promise.resolve(currentVersionInfo);
    } else {
      await this.storeCurrentVersionInfo();
      return Promise.resolve(this);
    }
  }

  /**
   * Store current version info.
   */
  public storeCurrentVersionInfo() {
    const jsonString = JSON.stringify(this);
    const currentVersionKey = `${versionInfoKey}-${this.version}`;
    return LocalStorage.setItem(currentVersionKey, jsonString);
  }

  /**
   * Remove current version info.
   */
  removeCurrentVersionInfo() {
    const currentVersionKey = `${versionInfoKey}-${this.version}`;
    LocalStorage.removeItem(currentVersionKey);
  }

  /**
   * Get version info with version key, return a promise EasydictInfo.
   */
  async getVersionInfo(versionKey: string): Promise<Easydict | undefined> {
    const jsonString = await LocalStorage.getItem<string>(versionKey);
    if (!jsonString) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(JSON.parse(jsonString));
  }

  /**
   * Check if need store current version info.
   */
  // private async checkHasNewVersion(): Promise<boolean> {
  //   const storedVersionInfo = await this.getCurrentStoredVersionInfo();
  //   if (storedVersionInfo) {
  //     const currentVersion = parseFloat(this.version);
  //     const storedVersion = parseFloat(storedVersionInfo.version);
  //     const hasNewVersion = currentVersion > storedVersion;
  //     return Promise.resolve(hasNewVersion);
  //   } else {
  //     this.storeCurrentVersionInfo();
  //   }
  //   return Promise.resolve(true);
  // }

  /**
   * Fetch release markdown, return a promise string.
   * First, fetech markdown from github, if failed, then fetch from localStorage.
   */
  public async fetchReleaseMarkdown(): Promise<string | undefined> {
    const currentVersionInfo = await this.getCurrentStoredVersionInfo();

    try {
      console.log("fetch release markdown from github");
      const releaseInfo = await this.fetchReleaseInfo(this.getReleaseApiUrl());
      if (releaseInfo) {
        const releaseBody = releaseInfo.body;
        // console.log("release body: ", releaseBody);
        if (releaseBody) {
          this.releaseMarkdown = releaseBody;
          this.storeCurrentVersionInfo();
          return Promise.resolve(releaseBody);
        }
      }
    } catch (error) {
      console.error(`fetch release markdown error: ${error}`);
      console.log(`read markdown from local storage: ${currentVersionInfo?.version}`);

      return Promise.resolve(currentVersionInfo?.releaseMarkdown);
    }
  }

  /**
   * Use axios to get github latest release, return a promise
   */
  public fetchReleaseInfo = async (releaseUrl: string) => {
    try {
      // console.log(`fetch release url: ${releaseUrl}`);
      const response = await axios.get(releaseUrl);
      return Promise.resolve(response.data);
    } catch (error) {
      return Promise.reject(error);
    }
  };
}