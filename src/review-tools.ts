// -*- mode: javascript; js-indent-level: 2 -*-

import * as exec from '@actions/exec'
import * as tools from './tools'

export type USNs = Record<string, string[]>

export interface Notices {
  outdated: boolean
  outdatedPackages: string[]
  usnsByPackage: USNs
}

export class ReviewTools {
  snapName: string
  snapFilePath?: string
  snapChannel: string

  constructor(snapName: string, channel?: string) {
    this.snapName = snapName
    this.snapChannel = channel || 'stable'
  }

  async checkNotices(): Promise<Notices> {
    await tools.ensureSnapd()
    await tools.ensureReviewTools()

    const snapFilePath = await this.getSnapFilePathOrDownload()

    const noticesJson = await this.getNoticesJson(snapFilePath)
    const usnsByPackage = noticesJson[this.snapName][this.snapChannel]

    return {
      outdated: Object.keys(usnsByPackage).length !== 0,
      outdatedPackages: Object.keys(usnsByPackage),
      usnsByPackage
    }
  }

  async getSnapFilePathOrDownload(): Promise<string> {
    if (this.snapFilePath === undefined) {
      const basename = `${this.snapName}_${this.snapChannel}`
      const filename = `${basename}.snap`
      await exec.exec('snap', [
        'download',
        this.snapName,
        '--channel',
        this.snapChannel,
        '--basename',
        basename
      ])
      this.snapFilePath = filename
    }
    return this.snapFilePath
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getNoticesJson(snapFilePath: string): Promise<any> {
    const chunks: Buffer[] = []

    const options = {
      listeners: {
        stdout(b: Buffer) {
          chunks.push(b)
        }
      }
    }

    await exec.exec('review-tools.check-notices', [snapFilePath], options)

    const noticesBuffer = Buffer.concat(chunks)

    return JSON.parse(noticesBuffer.toString('utf-8'))
  }
}
