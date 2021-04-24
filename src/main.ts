// -*- mode: javascript; js-indent-level: 2 -*-

import * as core from '@actions/core'
import {ReviewTools} from './review-tools'

async function run(): Promise<void> {
  try {
    const snapName: string = core.getInput('snap')
    const snapChannel: string = core.getInput('channel')

    const reviewTools = new ReviewTools(snapName, snapChannel)
    const notices = await reviewTools.checkNotices()

    core.setOutput('outdated', notices.outdated)
    core.setOutput('outdated-packages', notices.outdatedPackages)
    core.setOutput('usns-by-package', notices.usnsByPackage)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
